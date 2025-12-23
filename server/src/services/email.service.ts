import { logger } from '../utils/logger';
import { createOAuth2Client } from '../config/google.config';
import { Auth, google } from 'googleapis';
import ImapFlowClient from './support/imap';
import { simpleParser } from 'mailparser';
import { Email } from '../models/email';
import { EmailBody } from '../models/emailBody';

export class EmailService {

    private oauth2Client = createOAuth2Client();

    fetchGmailLabels = (credentials: Auth.Credentials) => {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail.users.labels.list({ userId: 'me' });
    }

    fetchGmailEmails = async (accessToken: string, userEmail: string, userId: string) => {
        const client = await ImapFlowClient(accessToken, userEmail);

        await client.connect();
        // logger.info('IMAP: Connected successfully');

        let lock = await client.getMailboxLock('INBOX');
        try {
            const total = client.mailbox.exists;
            // logger.info(`IMAP: INBOX has ${total} messages`);

            const emails = [];

            if (total > 0) {
                const start = Math.max(1, total - 49); // Fetch last 50 emails
                const range = `${start}:${total}`;

                let messages = await client.fetchAll(range, {
                    envelope: true,
                    flags: true,
                    source: true //full email source
                });

                for (let message of messages) {
                    if (!message.envelope || !message.flags) {
                        logger.warn(`Skipping message ${message.uid}: missing envelope or flags`);
                        continue;
                    }

                    const seen = message.flags.has('\\Seen') ? '' : '[UNREAD] ';

                    if (!message.source) {
                        logger.warn(`Skipping message ${message.uid}: missing source`);
                        continue;
                    }

                    const parsed = await simpleParser(message.source);

                    // Generate unique messageId
                    const messageId = `${userEmail}-${message.uid}`;
                    const threadId = message.envelope.messageId || messageId;

                    // first 200 chars
                    const textContent = parsed.text || (parsed.html ? String(parsed.html).replace(/<[^>]*>/g, '') : '');
                    const snippet = textContent.substring(0, 200).trim();

                    const [emailRecord, created] = await Email.upsert({
                        userId,
                        threadId,
                        messageId,
                        subject: message.envelope.subject || '(No Subject)',
                        sender: message.envelope.from?.[0]?.address || 'Unknown',
                        recipient: userEmail,
                        snippet,
                        isRead: message.flags.has('\\Seen'),
                        dateReceived: message.envelope.date || new Date(),
                    }, {
                        returning: true
                    });

                    await EmailBody.upsert({
                        emailId: emailRecord.id,
                        html: parsed.html ? String(parsed.html) : '',
                        text: parsed.text || '',
                    });

                    logger.info(`${created ? 'Created' : 'Updated'} email: ${emailRecord.id}`);

                    // Return only metadata for list view
                    emails.push({
                        id: emailRecord.id,
                        subject: emailRecord.subject,
                        from: emailRecord.sender,
                        senderName: message.envelope.from?.[0]?.name || '',
                        date: emailRecord.dateReceived,
                        snippet: emailRecord.snippet,
                        unseen: !emailRecord.isRead
                    });
                }
            }

            logger.info(`IMAP: Fetched and saved ${emails.length} messages`);

            return emails.reverse();

        } finally {
            lock.release();
            await client.logout();
            logger.info('IMAP: Logged out');
        }
    }

    async getEmailBody(emailId: number, userId: string) {
        const email = await Email.findOne({
            where: { id: emailId, userId },
            include: [{
                model: EmailBody,
                as: 'body',
                attributes: ['html', 'text']
            }]
        }) as (Email & { body?: EmailBody }) | null;

        if (!email) {
            throw new Error('Email not found');
        }

        // Mark as read
        if (!email.isRead) {
            await email.update({ isRead: true });
        }

        return {
            id: email.id,
            subject: email.subject,
            sender: email.sender,
            recipient: email.recipient,
            date: email.dateReceived,
            isRead: email.isRead,
            body: {
                html: email.body?.html || '',
                text: email.body?.text || ''
            }
        };
    }

    async getUserEmails(userId: string, limit: number = 50, offset: number = 0) {
        const emails = await Email.findAll({
            where: { userId },
            attributes: ['id', 'subject', 'sender', 'snippet', 'isRead', 'dateReceived'],
            order: [['dateReceived', 'DESC']],
            limit,
            offset
        });

        return emails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.sender,
            snippet: email.snippet,
            date: email.dateReceived,
            unseen: !email.isRead
        }));
    }
}
