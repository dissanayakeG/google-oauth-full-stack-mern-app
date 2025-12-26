import { Request, Response } from 'express';
import crypto from 'crypto';
import { OAuthService } from '@/services/oauth.service';
import Environment from '@/config/env.config';
import { GoogleCallbackRequestQueryDTO } from '@/types/oauth.dto';
import { logger } from '@/utils/logger';
import { UnauthorizedError } from '@/errors/UnauthorizedError';
import { EmailSyncService } from '@/services/email-sync.service';
import { CreateUserDTO } from '@/dtos/user.dto';

export class OAuthController {
  private oAuthservice = new OAuthService();
  private emailSyncService = new EmailSyncService();

  login = (req: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex');
    req.session.state = state;
    const authorizationUrl = this.oAuthservice.generateAuthUrl(state);

    res.redirect(authorizationUrl);
  };

  handleGoogleCallback = async (
    req: Request<unknown, unknown, unknown, GoogleCallbackRequestQueryDTO>,
    res: Response
  ) => {
    const { code, error, state } = req.query;

    if (error) {
      return res.redirect(
        `${Environment.FRONTEND_URL}/?auth=failed&error=${encodeURIComponent(error)}`
      );
    }

    const { tokens, googleUser } = await this.oAuthservice.handleGoogleCallback(
      code,
      req.session?.state,
      state
    );

    const createdUser = await this.oAuthservice.createOrUpdateUser({
      ...googleUser,
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
    } as CreateUserDTO);

    // Generate a Refresh Token
    const refreshToken = await this.oAuthservice.generateRefreshToken(createdUser);

    // Save refresh token to DB
    await this.oAuthservice.saveRefreshToken(createdUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: Environment.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    req.session.credentials = tokens;
    req.session.userId = createdUser.id;

    logger.info('Start fetch from initial callback');
    //TODO: this should happen only in first login
    this.emailSyncService.startGmailWatch(createdUser.email, tokens.access_token!);

    return res.redirect(`${Environment.FRONTEND_URL}/emails`);
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const { accessToken, newRefreshToken } = await this.oAuthservice.refreshSession(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: Environment.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.json({ accessToken });
  };

  authUser = async (req: Request, res: Response) => {
    res.json({ user: req.user });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const user = await this.oAuthservice.findUserByRefreshToken(refreshToken);

    if (refreshToken && user) await this.oAuthservice.clearRefreshToken(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: Environment.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.sendStatus(204);
  };
}
