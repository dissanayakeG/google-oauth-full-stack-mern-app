import { google, Auth } from 'googleapis';
import crypto from 'crypto';
import Environment from '../config/env.config';
import { CreateUserDTO } from '../dtos/user.dto';
import { User } from '../models/user';

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

    async saveRefreshToken(userId: string, refreshToken: string) {
        await User.update({ refreshToken }, { where: { id: userId } });
    }

    async findUserById(userId: string) {
        return User.findByPk(userId);
    }

    async findUserByRefreshToken(refreshToken: string) {
        return User.findOne({ where: { refreshToken } });
    }

}