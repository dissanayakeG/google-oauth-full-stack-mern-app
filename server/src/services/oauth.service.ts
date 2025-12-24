import { google } from 'googleapis';
import crypto from 'crypto';
import Environment from '../config/env.config';
import { CreateUserDTO } from '../dtos/user.dto';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../errors/ValidationError';
import { ConfigError } from '../errors/ConfigError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { createOAuth2Client } from '../config/google.config';
import { OAuthError } from '../errors/OAuthError';
import { CSRFError } from '../errors/CSRFError';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export class OAuthService {
    private oauth2Client = createOAuth2Client()
    private emailService = new EmailService();


    generateAuthUrl = (state: string): string => {
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
            prompt: 'consent' // force consent to always get a refresh token during development
        });
    }

    handleGoogleCallback = async (
        code: string,
        expectedState: string | undefined,
        actualState: string | undefined) => {

        if (!code) {
            throw new OAuthError('Missing OAuth code');
        }

        if (expectedState !== actualState) {
            throw new CSRFError();
        }

        const { tokens } = await this.oauth2Client.getToken(code);

        if (!tokens || !tokens.access_token) {
            throw new OAuthError('Failed to retrieve OAuth tokens');
        }

        this.oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2('v2');
        const userInfo = await oauth2.userinfo.get({ auth: this.oauth2Client });

        if (!userInfo.data.id || !userInfo.data.email || !userInfo.data.name) {
            throw new OAuthError('Invalid Google user profile');
        }

        return {
            tokens,
            googleUser: {
                id: userInfo.data.id,
                email: userInfo.data.email,
                name: userInfo.data.name,
                picture: userInfo.data.picture ?? undefined,
            },
        };
    }

    startGmailWatch = async (userEmail: string, accessToken: string) => {

        logger.info('step 2: startGmailWatch oauth service 😂😂😂😂😂😂');

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: 'v1', auth });

        const res = await gmail.users.watch({
            userId: 'me',
            requestBody: {
                labelIds: ['INBOX'],
                topicName: 'projects/able-armor-482015-a8/topics/gmail-push'
            }
        });

        const user = await User.findOne({
            where: { email: userEmail }
        });

        await this.emailService.syncGmailHistory(userEmail, res.data.historyId);
    }

    createOrUpdateUser = async (userData: CreateUserDTO): Promise<User> => {
        if (!userData.id || !userData.email || !userData.name) {
            throw new ValidationError('Invalid user data', []);
        }

        const [user, created] = await User.findOrCreate({
            where: { googleId: userData.id },
            defaults: {
                id: crypto.randomUUID(),
                email: userData.email,
                name: userData.name || 'Unknown',
                picture: userData.picture,
                googleId: userData.id,
                googleAccessToken: (userData as any).googleAccessToken,
                googleRefreshToken: (userData as any).googleRefreshToken
            }
        });

        let needsSave = false;

        // Update tokens if they are provided and different
        if ((userData as any).googleAccessToken && (userData as any).googleAccessToken !== user.googleAccessToken) {
            user.googleAccessToken = (userData as any).googleAccessToken;
            needsSave = true;
        }

        // Note: Google only sends refresh_token on first login or if prompt=consent
        if ((userData as any).googleRefreshToken && (userData as any).googleRefreshToken !== user.googleRefreshToken) {
            user.googleRefreshToken = (userData as any).googleRefreshToken;
            needsSave = true;
        }

        if (!created) {
            if (userData.picture !== user.picture || userData.name !== user.name) {
                user.name = userData.name || user.name;
                user.picture = userData.picture || user.picture;
                needsSave = true;
            }
        }

        if (needsSave) {
            await user.save();
        }

        return user;
    }

    refreshSession = async (refreshToken: string) => {

        const decoded = await this.verifyRefreshToken(refreshToken);

        if (typeof decoded !== 'object' || !decoded.userId) {
            throw new UnauthorizedError('Invalid refresh token payload');
        }

        const user = await this.findUserByRefreshToken(refreshToken);

        if (!user) {
            throw new UnauthorizedError('Refresh token does not match any user');
        }

        // token rotation
        await this.clearRefreshToken(decoded.userId);
        const accessToken = await this.generateAccessToken(user);
        const newRefreshToken = await this.generateRefreshToken(user);
        await this.saveRefreshToken(user.id, newRefreshToken);

        return { accessToken, newRefreshToken }
    }

    findUserById = async (userId: string) => {
        return User.findByPk(userId);
    }

    findUserByRefreshToken = async (refreshToken: string) => {
        return User.findOne({ where: { refreshToken } });
    }

    saveRefreshToken = async (userId: string, refreshToken: string) => {

        if (!userId || !refreshToken) {
            throw new ValidationError('Invalid refresh token payload', []);
        }

        await User.update({ refreshToken }, { where: { id: userId } });
    }

    clearRefreshToken = async (userId: string): Promise<void> => {
        if (!userId) {
            throw new ValidationError('User ID is required', []);
        }

        await User.update({ refreshToken: null }, { where: { id: userId } });
    }

    generateAccessToken = async (user: CreateUserDTO): Promise<string> => {
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            Environment.JWT_SECRET as string,
            { expiresIn: Environment.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        )

        return token;
    }

    generateRefreshToken = async (user: User): Promise<string> => {
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            Environment.REFRESH_TOKEN_SECRET as string,
            { expiresIn: Environment.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        )

        return token;
    }

    verifyRefreshToken = async (token: string) => {
        try {
            return jwt.verify(token, Environment.REFRESH_TOKEN_SECRET);
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }

    verifyAccessToken = async (token: string) => {
        try {
            return jwt.verify(token, Environment.JWT_SECRET);
        } catch {
            throw new UnauthorizedError('Invalid or expired access token');
        }
    }
}