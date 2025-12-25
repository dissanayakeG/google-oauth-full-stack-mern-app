import { google } from 'googleapis';
import { logger } from '../utils/logger';
import { Email, EmailBody } from '../config/db.config';
import { createOAuth2Client } from '../config/google.config';
import { User } from '../models/user';
import ImapFlowClient from './support/imap';
import { simpleParser, ParsedMail } from 'mailparser';
import Environment from '../config/env.config';

export class EmailSyncService {
    private oauth2Client = createOAuth2Client();

    private getGmailClient(accessToken: string) {
        const auth = this.oauth2Client;
        auth.setCredentials({ access_token: accessToken });
        return google.gmail({ version: 'v1', auth });
    }

    private async upsertEmail(params: {
        userId: string;
        userEmail: string;
        messageId: string;
        threadId: string;
        parsed: ParsedMail;
        isRead: boolean;
    }) {
        const { userId, userEmail, messageId, threadId, parsed, isRead } = params;

        const textContent = parsed.text || (parsed.html ? String(parsed.html).replace(/<[^>]*>/g, '') : '');
        const snippet = textContent.substring(0, 200).trim();

        const [emailRecord] = await Email.upsert({
            userId,
            threadId,
            messageId,
            subject: parsed.subject || '(No Subject)',
            sender: parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown',
            recipient: userEmail,
            snippet,
            isRead,
            dateReceived: parsed.date || new Date(),
        }, {
            returning: true
        });

        await EmailBody.upsert({
            emailId: emailRecord.id,
            html: parsed.html ? String(parsed.html) : '',
            text: parsed.text || '',
        });

        return emailRecord;
    }

    /**
     * Initial fetch on login and start watching for push notifications
     */
    startGmailWatch = async (userEmail: string, accessToken: string) => {
        logger.info({ userEmail }, 'Starting Gmail watch and initial sync');

        try {
            const gmail = this.getGmailClient(accessToken);
            const res = await gmail.users.watch({
                userId: 'me',
                requestBody: {
                    labelIds: ['INBOX'],
                    topicName: `projects/${Environment.GOOGLE_PUSH_NOTIFICATION_PROJECT_ID}/topics/${Environment.GOOGLE_PUSH_NOTIFICATION_TOPIC_NAME}`
                }
            });

            const historyId = res.data.historyId;
            if (historyId) {
                await this.syncGmailHistory(userEmail, historyId);
            }
        } catch (error: any) {
            logger.error({ err: error, userEmail }, 'Failed to start Gmail watch');
        }
    }

    /**
     * Sync Gmail by push notifications or initial login
     * call this method from EmailSyncController (listen to push notifications)
     * and startGmailWatch via OAuthController's callback
     */
    syncGmailHistory = async (emailAddress: string, newHistoryId: string) => {

        // TODO : For now, consider user has one Gmail account
        const user = await User.findOne({ where: { email: emailAddress } });

        if (!user) {
            logger.warn({ emailAddress }, 'Sync failed, unknown Gmail account');
            return;
        }

        try {
            const accessToken = await this.getValidAccessToken(user);
            const lastHistoryId = user.gmailHistoryId;

            if (!lastHistoryId) {
                await this.fetchInitialEmails(accessToken, emailAddress, user.id);
            } else {
                await this.fetchMessagesSinceHistoryId(emailAddress, accessToken, lastHistoryId, user.id);
            }

            await user.update({ gmailHistoryId: newHistoryId });
            logger.info({ emailAddress, newHistoryId }, 'Gmail sync completed successfully');
        } catch (error: any) {
            logger.error({ err: error, emailAddress }, 'Failed to sync Gmail history');
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
            const { token } = await this.oauth2Client.getAccessToken();
            if (!token) throw new Error('Failed to refresh Google access token');

            if (token !== user.googleAccessToken) {
                await user.update({ googleAccessToken: token });
            }
            return token;
        } catch (error: any) {
            logger.error({ err: error, userId: user.id }, 'Error refreshing Google access token');
            throw error;
        }
    }

    private fetchMessagesSinceHistoryId = async (
        userEmail: string,
        accessToken: string,
        startHistoryId: string,
        userId: string
    ) => {
        const gmail = this.getGmailClient(accessToken);
        let pageToken: string | undefined;
        const messageIds = new Set<string>();

        do {
            const res = await gmail.users.history.list({
                userId: 'me',
                startHistoryId,
                historyTypes: ['messageAdded'],
                pageToken,
            });

            res.data.history?.forEach(h => {
                h.messages?.forEach(msg => {
                    if (msg.id) messageIds.add(msg.id);
                });
            });

            pageToken = res.data.nextPageToken || undefined;
        } while (pageToken);

        if (messageIds.size === 0) return;

        for (const messageId of messageIds) {
            try {
                const msg = await gmail.users.messages.get({
                    userId: 'me',
                    id: messageId,
                    format: 'raw',
                });

                const raw = Buffer.from(msg.data.raw || '', 'base64').toString('utf8');
                const parsed = await simpleParser(raw);

                await this.upsertEmail({
                    userId,
                    userEmail,
                    messageId: `${userEmail}-${messageId}`,
                    threadId: msg.data.threadId || messageId,
                    parsed,
                    isRead: !msg.data.labelIds?.includes('UNREAD'),
                });
            } catch (error: any) {
                logger.error({ err: error, messageId }, 'Failed to fetch/store single message from history');
            }
        }
        logger.info({ userEmail, count: messageIds.size }, 'Synced new messages via history');
    }

    /**
     * Fetch initial emails via IMAP
     */
    private fetchInitialEmails = async (
        accessToken: string,
        userEmail: string,
        userId: string
    ) => {
        logger.info({ userEmail }, 'Performing initial IMAP sync');

        const client = await ImapFlowClient(accessToken, userEmail);

        await client.connect();

        let lock = await client.getMailboxLock('INBOX');

        try {
            if (!client.mailbox) return;

            const total = client.mailbox.exists;

            if (total > 0) {
                const start = Math.max(1, total - 49);
                const messages = await client.fetchAll(`${start}:${total}`, {
                    envelope: true,
                    flags: true,
                    source: true
                });

                for (let message of messages) {
                    if (!message.source) continue;

                    const parsed = await simpleParser(message.source);

                    await this.upsertEmail({
                        userId,
                        userEmail,
                        messageId: `${userEmail}-${message.uid}`,
                        threadId: message.envelope?.messageId || `${userEmail}-${message.uid}`,
                        parsed,
                        isRead: message.flags?.has('\\Seen') || false,
                    });
                }
            }
        } finally {
            lock.release();
            await client.logout();
        }
    }
}