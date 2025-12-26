import { UnauthorizedError } from '@/errors/UnauthorizedError';
import { EmailService } from '@/services/emails.service';
import { Request, Response } from 'express';
import { NotFoundError } from '@/errors/NotFoundError';
import { JwtPayload } from 'jsonwebtoken';
import { apiResponse } from '@/utils/api.response';
import { GetAllEmailsRequestQueryDTO } from '@/schemas/email.schema';

export class EmailController {
  private emailService = new EmailService();

  index = async (
    req: Request<unknown, unknown, unknown, GetAllEmailsRequestQueryDTO>,
    res: Response
  ) => {
    const { limit = 20, offset = 0, search = '', isRead } = req.query;

    const user = req.user;

    const filters = { search, isRead };

    const result = await this.emailService.findAll(
      user.userId,
      Number(limit),
      Number(offset),
      filters
    );

    const formattedResult = {
      emails: result.emails,
      limit: Number(limit),
      offset: Number(offset),
      total: result.total,
      hasMore: Number(offset) + Number(limit) < result.total,
    };

    return apiResponse({
      res,
      data: formattedResult,
      message: 'Emails fetched successfully',
      status: 200,
    });
  };

  show = async (req: Request, res: Response) => {
    const user = req.user as { userId: string };
    const emailId = parseInt(req.params.id);

    if (!user || !user.userId) {
      throw new UnauthorizedError();
    }

    if (isNaN(emailId)) {
      return res.status(400).json({ message: 'Invalid email ID' });
    }

    const email = await this.emailService.findOneWithBody(emailId, user.userId);

    if (!email) {
      throw new NotFoundError();
    }

    const updatedEmail = await this.emailService.markAsRead(email.id);

    if (!updatedEmail) {
      throw new NotFoundError();
    }

    const emailResponse = {
      id: updatedEmail.id,
      subject: updatedEmail.subject,
      sender: updatedEmail.sender,
      recipient: updatedEmail.recipient,
      date: updatedEmail.dateReceived,
      isRead: updatedEmail.isRead,
      body: {
        html: updatedEmail.body?.html || '',
        text: updatedEmail.body?.text || '',
      },
    };

    res.status(200).json({ data: emailResponse });
  };

  labels = async (req: Request, res: Response) => {
    const user = req.user;

    if (!user || typeof user === 'string') {
      throw new UnauthorizedError('No refresh token provided');
    }

    const userId = (user as JwtPayload).userId as string;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized: User ID missing');
    }

    const credentials = req.session?.credentials;
    if (!credentials) {
      throw new UnauthorizedError('No OAuth2 credentials found');
    }

    const response = await this.emailService.fetchLabels(credentials);
    const labels = response.data.labels || [];

    res.json({ labels });
  };
}
