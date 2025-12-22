import { google, Auth } from 'googleapis';
import crypto from 'crypto';
import Environment from '../config/env.config';
import { CreateUserDTO } from '../dtos/user.dto';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';


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
            // 'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid'
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state: state
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
        if (!userData.id) { // googleId in controller
            throw new Error("Google ID is required");
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
            console.log('clearRefreshTokenerror:::::',error);
            // throw new Error('Failed to clear refresh token');
        }
    }

    async generateAccessToken(user: CreateUserDTO): Promise<string> {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
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
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
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
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }
        return jwt.verify(token, Environment.REFRESH_TOKEN_SECRET);
    }

    async verifyAccessToken(token: string) {
        if (!Environment.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return jwt.verify(token, Environment.JWT_SECRET);
    }

}