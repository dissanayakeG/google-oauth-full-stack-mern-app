import { NextFunction, Request, Response } from "express";
import crypto from 'crypto';
import { OAuthService } from "../services/oauth.service";
import Environment from "../config/env.config";
import { GoogleCallbackRequestQueryDTO } from "../types/oauth.dto";
import jwt from 'jsonwebtoken';

export class OAuthController {

    private oAuthservice: OAuthService;

    constructor() {
        this.oAuthservice = new OAuthService();
        this.login = this.login.bind(this);
        this.callback = this.callback.bind(this);
    }

    login(req: Request, res: Response, next: NextFunction) {

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

    async callback(req: Request<unknown, unknown, unknown, GoogleCallbackRequestQueryDTO>, res: Response, next: NextFunction) {

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

            console.log('callbecked:', tokens, googleUser);

            if (googleUser.id && googleUser.email && googleUser.name && googleUser.picture) {
                const user = await this.oAuthservice.createOrUpdateUser({
                    id: googleUser.id,
                    email: googleUser.email,
                    name: googleUser.name,
                    picture: googleUser.picture
                });

                // Generate Tokens
                const accessToken = jwt.sign(
                    { userId: user.id, email: user.email, name: user.name },
                    Environment.JWT_SECRET as string,
                    { expiresIn: Environment.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
                );

                const refreshToken = jwt.sign(
                    { userId: user.id },
                    Environment.REFRESH_TOKEN_SECRET as string,
                    { expiresIn: Environment.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
                );

                // Save refresh token to DB
                await this.oAuthservice.saveRefreshToken(user.id, refreshToken);

                // Send cookies
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: Environment.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 15 * 60 * 1000 // 15 mins to match ACCESS_TOKEN_EXPIRY logic roughly
                });

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: Environment.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });

                req.session.credentials = tokens;
                req.session.userId = user.id;

                res.redirect(`${Environment.FRONTEND_URL}/dashboard?auth=success`);
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

}