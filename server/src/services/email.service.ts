import { ImapFlow } from 'imapflow';
import { logger } from '../utils/logger';
import { createOAuth2Client } from '../config/google.config';
import { Auth, google } from 'googleapis';
import { requestLogger } from '../middlewares/requestLogger';
import ImapFlowClient from './support/imap';

export class EmailService {

    private oauth2Client = createOAuth2Client();

    fetchGmailLabels(credentials: Auth.Credentials) {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail.users.labels.list({ userId: 'me' });
    }

    async fetchGmailEmails(accessToken: string, userEmail: string) {
        const client = await ImapFlowClient(accessToken, userEmail);

        await client.connect();

        logger.info('IMAP: Connected successfully');
        let lock = await client.getMailboxLock('INBOX');
        try {
            const total = client.mailbox.exists;
            logger.info(`IMAP: INBOX has ${total} messages`);

            const emails = [];

            if (total > 0) {
                const start = Math.max(1, total - 9);
                const range = `${start}:${total}`;

                logger.info(`IMAP: Fetching messages ${range}`);

                let messages = await client.fetchAll(range, {
                    envelope: true,
                    flags: true
                });


                for (let message of messages) {
                    
                    const seen = message.flags.has('\\Seen') ? '' : '[UNREAD] ';
                    logger.info(`${seen}${message.uid}: ${message.envelope.subject}`);

                    const { content } = await client.download(message.uid, 'TEXT');
                    let a = content.toString();
                    logger.info({ a,message }, "😁😁😁😁😁😁😁😁😁")

                    emails.push({
                        id: message.uid,
                        subject: message.envelope.subject || '(No Subject)',
                        from: message.envelope.from[0]?.address || 'Unknown',
                        senderName: message.envelope.from[0]?.name || '',
                        date: message.envelope.date,
                        unseen: !message.flags.has('\\Seen')
                    });
                }
            }

            logger.info(`IMAP: Fetched ${emails.length} messages`);
            return emails.reverse();

        } finally {
            lock.release();
            await client.logout();
            logger.info('IMAP: Logged out');
        }
    }
}