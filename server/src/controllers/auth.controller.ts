import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthService } from '@/services/auth.service';
import Environment from '@/config/env.config';
import { GoogleCallbackRequestQueryDTO } from '@/types/oauth.dto';
import { logger } from '@/utils/logger';
import { UnauthorizedError } from '@/errors/UnauthorizedError';
import { EmailSyncService } from '@/services/emails-sync.service';
import { CreateUserDTO } from '@/dtos/user.dto';
import { apiResponse } from '@/utils/api.response';

export class AuthController {
  private authService = new AuthService();
  private emailSyncService = new EmailSyncService();

  redirectToGoogle = (req: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex');
    req.session.state = state;
    const authorizationUrl = this.authService.generateAuthUrl(state);

    res.redirect(authorizationUrl);
  };

  handleCallback = async (
    req: Request<unknown, unknown, unknown, GoogleCallbackRequestQueryDTO>,
    res: Response
  ) => {
    const { code, error, state } = req.query;

    if (error) {
      return res.redirect(
        `${Environment.FRONTEND_URL}/?auth=failed&error=${encodeURIComponent(error)}`
      );
    }

    const { tokens, googleUser } = await this.authService.exchangeCodeForTokens(
      code,
      req.session?.state,
      state
    );

    const createdUser = await this.authService.findOrCreateUser({
      ...googleUser,
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
    } as CreateUserDTO);

    const refreshToken = await this.authService.generateRefreshToken(createdUser);

    await this.authService.storeRefreshToken(createdUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: Environment.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    req.session.credentials = tokens;
    req.session.userId = createdUser.id;

    logger.info('Start fetch from initial callback');
    this.emailSyncService.startGmailWatch(createdUser.email, tokens.access_token!);

    return res.redirect(`${Environment.FRONTEND_URL}/emails`);
  };

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const { accessToken, newRefreshToken } = await this.authService.rotateTokens(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: Environment.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return apiResponse({
      res,
      data: { accessToken },
      message: 'Token refreshed successfully',
      status: 200,
    });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const user = await this.authService.findUserByToken(refreshToken);

    if (refreshToken && user) await this.authService.revokeRefreshToken(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: Environment.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return apiResponse({
      res,
      data: null,
      message: 'Logged out successfully',
      status: 204,
    });
  };
}
