import { logger } from '../utils/logger';
import { createOAuth2Client } from '../config/google.config';
import { Auth, google } from 'googleapis';
import ImapFlowClient from './support/imap';
import { simpleParser } from 'mailparser';
import { Email } from '../models/email';
import { EmailBody } from '../models/emailBody';
import { Request } from 'express';
import { User } from '../models/user';

export class EmailService {

    private oauth2Client = createOAuth2Client();



    fetchGmailLabels = (credentials: Auth.Credentials) => {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail.users.labels.list({ userId: 'me' });
    }

    //fetch and upate db
    fetchGmailEmails = async (accessToken: string, userEmail: string, userId: string) => {

        console.log('step 3 : fetchGmailEmails email service😈😈😈😈😈😈😈😈😈😈😈😈');

        const client = await ImapFlowClient(accessToken, userEmail);

        await client.connect();

        let lock = await client.getMailboxLock('INBOX');
        try {
            const total = client.mailbox.exists;

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

                    // logger.info(`${created ? 'Created' : 'Updated'} email: ${emailRecord.id}`);

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

            // logger.info(`IMAP: Fetched and saved ${emails.length} messages`);

            return emails.reverse();

        } finally {
            lock.release();
            await client.logout();
            // logger.info('IMAP: Logged out');
        }
    }

    //get from db
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

    syncGmailHistory = async (emailAddress: string, newHistoryId: string) => {
        logger.info('step 2: syncGmailHistory email service 🥹🥹🥹🥹🥹');
        const user = await User.findOne({
            where: { email: emailAddress }
        });

        if (!user) {
            logger.warn(`Unknown Gmail account: ${emailAddress}`);
            return;
        }

        try {
            const accessToken = await this.getValidAccessToken(user);
            const lastHistoryId = user.gmailHistoryId;

            if (!lastHistoryId) {
                await this.fetchGmailEmails(
                    accessToken,
                    emailAddress,
                    user.id
                );
            } else {
                await this.fetchMessagesSinceHistoryId(
                    emailAddress,
                    accessToken,
                    lastHistoryId,
                    user.id
                );
            }

            await user.update({ gmailHistoryId: newHistoryId });
        } catch (error: any) {
            logger.error({ err: error, emailAddress }, `Failed to sync Gmail history`);
        }
    }

    private async getValidAccessToken(user: User): Promise<string> {
        if (!user.googleRefreshToken) {
            throw new Error('No Google refresh token found for user');
        }

        this.oauth2Client.setCredentials({
            refresh_token: user.googleRefreshToken,
            access_token: user.googleAccessToken || undefined
        });

        try {
            // refreshAccessToken() is deprecated in newer google-auth-library, 
            // but the oauth2Client handles it automatically if we setCredentials and make a request.
            // However, to be explicit and avoid waiting for an auth error:
            const { token } = await this.oauth2Client.getAccessToken();

            if (!token) {
                throw new Error('Failed to refresh Google access token');
            }

            // Update stored access token if it changed
            if (token !== user.googleAccessToken) {
                await user.update({ googleAccessToken: token });
            }

            return token;
        } catch (error: any) {
            logger.error({ err: error, userId: user.id }, 'Error refreshing Google access token');
            throw error;
        }
    }

    fetchMessagesSinceHistoryId = async (
        userEmail: string,
        accessToken: string,
        startHistoryId: string,
        userId: string) => {

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth });

        let pageToken: string | undefined;
        const messageIds = new Set<string>();

        // 1️⃣ Pull history
        do {
            const res = await gmail.users.history.list({
                userId: 'me',
                startHistoryId,
                historyTypes: ['messageAdded'],
                pageToken,
            });

            for (const h of res.data.history || []) {
                for (const msg of h.messages || []) {
                    messageIds.add(msg.id!);
                }
            }

            pageToken = res.data.nextPageToken || undefined;
        } while (pageToken);

        if (messageIds.size === 0) {
            console.log('No new messages');
            return;
        }

        // 2️⃣ Fetch & store messages
        for (const messageId of messageIds) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'raw',
            });

            const raw = Buffer.from(msg.data.raw!, 'base64').toString('utf8');
            const parsed = await simpleParser(raw);

            const snippet =
                parsed.text?.slice(0, 200) ||
                parsed.html?.replace(/<[^>]*>/g, '').slice(0, 200) ||
                '';

            // UNIQUE ID (critical)
            const uniqueMessageId = `${userEmail}-${messageId}`;

            const [email] = await Email.upsert(
                {
                    userId,
                    messageId: uniqueMessageId,
                    threadId: msg.data.threadId!,
                    subject: parsed.subject || '(No Subject)',
                    sender: parsed.from?.text || 'Unknown',
                    recipient: userEmail,
                    snippet,
                    isRead: msg.data.labelIds?.includes('UNREAD') === false,
                    dateReceived: parsed.date || new Date(),
                },
                { returning: true }
            );

            await EmailBody.upsert({
                emailId: email.id,
                html: parsed.html || '',
                text: parsed.text || '',
            });
        }

        console.log(`Synced ${messageIds.size} new messages`);

    }

}
