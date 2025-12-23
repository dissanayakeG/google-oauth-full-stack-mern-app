import { google, Auth } from 'googleapis';
import crypto from 'crypto';
import Environment from '../config/env.config';
import { CreateUserDTO } from '../dtos/user.dto';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { ImapFlow } from 'imapflow';
import { ValidationError } from '../errors/ValidationError';
import { InternalServerError } from '../errors/InternalServerError';
import { ConfigError } from '../errors/ConfigError';
import { UnauthorizedError } from '../errors/UnauthorizedError';


export class OAuthService {
    private oauth2Client: Auth.OAuth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            Environment.GOOGLE_CLIENT_ID,
            Environment.GOOGLE_CLIENT_SECRET,
            Environment.GOOGLE_REDIRECT_URL
        );
    }

    generateAuthUrl(state: string): string {
        const scopes = [
            'https://mail.google.com/',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state: state,
            //prompt: 'consent' //this will ask to select an account each time
        });
    }

    async getGoogleUser(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2('v2');
        const userInfo = await oauth2.userinfo.get({ auth: this.oauth2Client });

        return {
            tokens,
            user: userInfo.data
        };
    }

    async createOrUpdateUser(userData: CreateUserDTO): Promise<User> {
        if (!userData.id) {
            throw new ValidationError("Google ID is required", []);
        }

        const [user, created] = await User.findOrCreate({
            where: { googleId: userData.id },
            defaults: {
                id: crypto.randomUUID(),
                email: userData.email || '',
                name: userData.name || 'Unknown',
                picture: userData.picture,
                googleId: userData.id
            }
        });

        if (!created) {
            if (userData.picture !== user.picture || userData.name !== user.name) {
                user.name = userData.name || user.name;
                user.picture = userData.picture || user.picture;
                await user.save();
            }
        }

        return user;
    }

    async findUserById(userId: string) {
        return User.findByPk(userId);
    }

    async findUserByRefreshToken(refreshToken: string) {
        return User.findOne({ where: { refreshToken } });
    }

    async saveRefreshToken(userId: string, refreshToken: string) {
        await User.update({ refreshToken }, { where: { id: userId } });
    }

    async clearRefreshToken(userId: string): Promise<void> {
        try {
            await User.update({ refreshToken: null }, { where: { id: userId } });
        } catch (error) {
            throw new InternalServerError('Failed to clear refresh token');
        }
    }

    async generateAccessToken(user: CreateUserDTO): Promise<string> {
        if (!Environment.JWT_SECRET) {
            throw new ConfigError('JWT_SECRET is not defined');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            Environment.JWT_SECRET as string,
            { expiresIn: Environment.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        )

        return token;
    }

    async generateRefreshToken(user: User): Promise<string> {
        if (!Environment.REFRESH_TOKEN_SECRET) {
            throw new ConfigError('REFRESH_TOKEN_SECRET is not defined');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            Environment.REFRESH_TOKEN_SECRET as string,
            { expiresIn: Environment.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        )

        return token;
    }

    async verifyRefreshToken(token: string) {
        if (!Environment.REFRESH_TOKEN_SECRET) {
            throw new ConfigError('REFRESH_TOKEN_SECRET is not defined');
        }
        try {
            return jwt.verify(token, Environment.REFRESH_TOKEN_SECRET);
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }

    async verifyAccessToken(token: string) {
        if (!Environment.JWT_SECRET) {
            throw new ConfigError('JWT_SECRET is not defined');

        }
        try {
            return jwt.verify(token, Environment.JWT_SECRET);
        } catch {
            throw new UnauthorizedError('Invalid or expired access token');
        }
    }

    fetchGmailLabels(credentials: Auth.Credentials) {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        return gmail.users.labels.list({ userId: 'me' });
    }


    async fetchEmailsViaIMAP(accessToken: string, userEmail: string) {
        const { ImapFlow } = await import('imapflow');

        console.log('IMAP: Connecting with email:', userEmail);
        console.log('IMAP: Token length:', accessToken?.length);

        const client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: userEmail,
                accessToken: accessToken,
            },
            logger: {
                debug: (obj: any) => console.log('IMAP DEBUG:', obj),
                info: (obj: any) => console.log('IMAP INFO:', obj),
                warn: (obj: any) => console.warn('IMAP WARN:', obj),
                error: (obj: any) => console.error('IMAP ERROR:', obj)
            }
        });

        return await this.fetchEmails(client).catch(console.error);
    }

    async fetchEmails(client: ImapFlow) {
        // Connect
        await client.connect();
        console.log('IMAP: Connected successfully');

        // Select INBOX
        let lock = await client.getMailboxLock('INBOX');
        try {
            const total = client.mailbox.exists;
            console.log(`IMAP: INBOX has ${total} messages`);

            const emails = [];

            if (total > 0) {
                // Calculate range for last 10 messages
                const start = Math.max(1, total - 9);
                const range = `${start}:${total}`;

                console.log(`IMAP: Fetching messages ${range}`);

                // Fetch latest 10 messages (or all if less than 10)
                let messages = await client.fetchAll(range, {
                    envelope: true,
                    flags: true
                });

                for (let message of messages) {
                    const seen = message.flags.has('\\Seen') ? '' : '[UNREAD] ';
                    console.log(`${seen}${message.uid}: ${message.envelope.subject}`);

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

            console.log(`IMAP: Fetched ${emails.length} messages`);

            // Reverse to show newest first
            return emails.reverse();

        } finally {
            lock.release();
            await client.logout();
            console.log('IMAP: Logged out');
        }
    }

}