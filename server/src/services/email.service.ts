import { ImapFlow } from 'imapflow';
import { logger } from '../utils/logger';
import { createOAuth2Client } from '../config/google.config';
import { Auth, google } from 'googleapis';

export class EmailService {

    private oauth2Client = createOAuth2Client();

    fetchGmailLabels(credentials: Auth.Credentials) {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail.users.labels.list({ userId: 'me' });
    }

    async fetchEmailsViaIMAP(accessToken: string, userEmail: string) {
        const { ImapFlow } = await import('imapflow');
        const client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: userEmail,
                accessToken: accessToken,
            },
            logger: {
                debug: (obj: any) => logger.debug('IMAP DEBUG:', obj),
                info: (obj: any) => logger.info({ obj }, 'IMAP INFO:'),
                warn: (obj: any) => logger.warn({ obj }, 'IMAP WARN:'),
                error: (obj: any) => logger.error('IMAP ERROR:', obj)
            }
        });

        return await this.fetchEmails(client).catch(console.error);
    }

    async fetchEmails(client: ImapFlow) {
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