import { NextFunction, Request, Response } from "express";
import crypto from 'crypto';
import { OAuthService } from "../services/oauth.service";
import Environment from "../config/env.config";
import { GoogleCallbackRequestQueryDTO } from "../types/oauth.dto";

export class OAuthController {

    private oAuthservice = new OAuthService();

    login = (req: Request, res: Response, next: NextFunction) => {
        console.log('login hit!');
        try {
            const state = crypto.randomBytes(32).toString('hex');
            req.session.state = state;
            const authorizationUrl = this.oAuthservice.generateAuthUrl(state);
            res.redirect(authorizationUrl);

        } catch (error) {
            console.error('Login error:', error);
            next(error);
        }
    }

    callback = async (req: Request<unknown, unknown, unknown, GoogleCallbackRequestQueryDTO>, res: Response, next: NextFunction) => {
        console.log('call back hit!');
        try {

            const { code, error, state } = req.query;

            if (error) {
                console.log('Error from google:', error)
                return res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=${encodeURIComponent(error)}`);
            }

            if (state !== req.session?.state) {
                console.error('State mismatch. Possible CSRF attack');
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

                console.log('redirect:', `${Environment.FRONTEND_URL}/dashboard`, user.email);

                res.redirect(`${Environment.FRONTEND_URL}/dashboard`);
            } else {
                console.error('Missing user info from Google');
                res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=missing_info`);
            }
        } catch (error) {
            console.error('Error during OAuth2 callback:', error);
            if (error instanceof Error) {
                res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=${encodeURIComponent(error.message)}`);
            } else {
                res.redirect(`${Environment.FRONTEND_URL}/?auth=failed&error=unknown`);
            }
        }

    }

    refresh = async (req: Request, res: Response, next: NextFunction) => {

        const refreshToken = req.cookies?.refreshToken;

        try {
            if (!refreshToken) {
                return res.status(401).json({ message: 'No refresh token provided' });
            }

            const decoded = await this.oAuthservice.verifyRefreshToken(refreshToken);
            // debugger
            const user = await this.oAuthservice.findUserByRefreshToken(refreshToken);

            console.log('USER:', user);
            console.log('decoded:', decoded);

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

        } catch (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' + err });
        }
    }

    authUser = async (req: Request, res: Response, next: NextFunction) => {
        res.json({ user: req.user });
    }

    logout = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            const user = await this.oAuthservice.findUserByRefreshToken(refreshToken);

            if (refreshToken && user) await this.oAuthservice.clearRefreshToken(user.id);

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: Environment.NODE_ENV === "production",
                sameSite: "strict",
            });
            res.sendStatus(204);
        } catch (err) {
            res.sendStatus(500);
        }
    };

    getGmailLabels = async (req: Request, res: Response, next: NextFunction) => {
        console.log('getGmailLabels hit!');
        try {
            const user = req.user;

            if (!user || typeof user === 'string') {
                console.log('No valid user payload', user);
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userId = (user as any).userId;
            if (!userId) {
                console.log('No userId in payload', user);
                return res.status(401).json({ message: 'Unauthorized: User ID missing' });
            }

            const credentials = req.session?.credentials;
            if (!credentials) {
                console.log('no credentials');
                return res.status(401).json({ message: 'No OAuth2 credentials found' });
            }

            const response = await this.oAuthservice.fetchGmailLabels(credentials);
            const labels = response.data.labels || [];

            console.log('Gmail labels fetched successfully');
            res.json({ labels });

        } catch (error) {
            console.error('Error fetching Gmail labels:', error);
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

            // console.log('Session credentials:', {
            //     hasAccessToken: !!req.session?.credentials?.access_token,
            //     hasRefreshToken: !!req.session?.credentials?.refresh_token,
            //     scope: req.session?.credentials?.scope,
            //     tokenType: req.session?.credentials?.token_type
            // });

            const emails = await this.oAuthservice.fetchEmailsViaIMAP(googleAccessToken, user.email);
            res.json({ emails });

        } catch (error: any) {
            console.error('Error fetching Gmail emails:', error);

            if (error.message.includes('AUTHENTICATIONFAILED')) {
                return res.status(401).json({ message: 'Token expired' });
            }

            res.status(500).json({ message: 'Failed to fetch Gmail emails' });
        }
    }

}