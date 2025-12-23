import { NextFunction, Request, Response } from "express";
import crypto from 'crypto';
import { OAuthService } from "../services/oauth.service";
import Environment from "../config/env.config";
import { GoogleCallbackRequestQueryDTO } from "../types/oauth.dto";
import { logger } from "../utils/logger";

export class OAuthController {

    private oAuthservice = new OAuthService();

    login = (req: Request, res: Response, next: NextFunction) => {

        const state = crypto.randomBytes(32).toString('hex');
        req.session.state = state;
        const authorizationUrl = this.oAuthservice.generateAuthUrl(state);
        res.redirect(authorizationUrl);

    }

    callback = async (req: Request<unknown, unknown, unknown, GoogleCallbackRequestQueryDTO>, res: Response, next: NextFunction) => {

        const { code, error, state } = req.query;

        if (error) {
            logger.error(`OAuth callback error ${error}`);
            return res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=${encodeURIComponent(error)}`);
        }

        if (state !== req.session?.state) {
            logger.error('State mismatch. Possible CSRF attack');
            return res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=csrf`);
        }

        const { tokens, user: googleUser } = await this.oAuthservice.getGoogleUser(code);

        if (googleUser.id && googleUser.email && googleUser.name && googleUser.picture) {
            const user = await this.oAuthservice.createOrUpdateUser({
                id: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture
            });

            // Generate new Access Token
            const refreshToken = await this.oAuthservice.generateRefreshToken(user);

            // Save refresh token to DB
            await this.oAuthservice.saveRefreshToken(user.id, refreshToken);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: Environment.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            req.session.credentials = tokens;
            req.session.userId = user.id;

            logger.info({ user }, `redirect: ${Environment.FRONTEND_URL}/dashboard`);

            res.redirect(`${Environment.FRONTEND_URL}/dashboard`);
        } else {
            logger.error('Missing user info from Google');
            res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=missing_info`);
        }

    }

    refresh = async (req: Request, res: Response, next: NextFunction) => {

        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const decoded = await this.oAuthservice.verifyRefreshToken(refreshToken);
        // debugger
        const user = await this.oAuthservice.findUserByRefreshToken(refreshToken);

        logger.info({ user }, 'USER:');
        logger.info({ decoded }, 'decoded:');

        if (!user) {
            throw new Error('Refresh token does not match any user');

        }

        if (typeof decoded === 'string') {
            throw new Error('Invalid token structure');
        }

        // Invalidate the old token
        await this.oAuthservice.clearRefreshToken(decoded.userId);

        // Issue new Access Token
        const accessToken = await this.oAuthservice.generateAccessToken(user);

        // Generate new refresh Token
        const newRefreshToken = await this.oAuthservice.generateRefreshToken(user);

        // Save refresh token to DB
        await this.oAuthservice.saveRefreshToken(user.id, newRefreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: Environment.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        res.json({ message: 'Token refreshed', accessToken });
    }

    authUser = async (req: Request, res: Response, next: NextFunction) => {
        res.json({ user: req.user });
    }

    logout = async (req: Request, res: Response) => {

        const refreshToken = req.cookies.refreshToken;
        const user = await this.oAuthservice.findUserByRefreshToken(refreshToken);

        if (refreshToken && user) await this.oAuthservice.clearRefreshToken(user.id);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: Environment.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.sendStatus(204);

    };

    getGmailLabels = async (req: Request, res: Response, next: NextFunction) => {
        logger.info('getGmailLabels hit!');
        try {
            const user = req.user;

            if (!user || typeof user === 'string') {
                logger.info({ user }, 'No valid user payload');
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userId = (user as any).userId;
            if (!userId) {
                logger.info({ user }, 'No userId in payload');
                return res.status(401).json({ message: 'Unauthorized: User ID missing' });
            }

            const credentials = req.session?.credentials;
            if (!credentials) {
                logger.info('no credentials');
                return res.status(401).json({ message: 'No OAuth2 credentials found' });
            }

            const response = await this.oAuthservice.fetchGmailLabels(credentials);
            const labels = response.data.labels || [];

            logger.info('Gmail labels fetched successfully');
            res.json({ labels });

        } catch (error) {
            logger.error(`Error fetching Gmail labels: ${error}`);
            res.status(500).json({ message: 'Failed to fetch Gmail labels' });
        }
    }

    getGmailEmails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId: string; email: string };

            if (!user || !user.email) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const googleAccessToken = req.session?.credentials?.access_token;

            if (!googleAccessToken) {
                return res.status(401).json({ message: 'No Google OAuth access token found in session' });
            }

            // logger.info({
            //     hasAccessToken: !!req.session?.credentials?.access_token,
            //     hasRefreshToken: !!req.session?.credentials?.refresh_token,
            //     scope: req.session?.credentials?.scope,
            //     tokenType: req.session?.credentials?.token_type
            // }, 'Session credentials:');

            const emails = await this.oAuthservice.fetchEmailsViaIMAP(googleAccessToken, user.email);
            res.json({ emails });

        } catch (error: any) {
            logger.error(`Error fetching Gmail emails: ${error}`);

            if (error.message.includes('AUTHENTICATIONFAILED')) {
                return res.status(401).json({ message: 'Token expired' });
            }

            res.status(500).json({ message: 'Failed to fetch Gmail emails' });
        }
    }

}