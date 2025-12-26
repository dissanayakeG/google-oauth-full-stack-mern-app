import { EmailService } from '@/services/emails.service';
import { Request, Response } from 'express';
import { NotFoundError } from '@/errors/NotFoundError';
import { apiResponse } from '@/utils/api.response';
import { GetAllEmailsRequestQueryDTO } from '@/dtos/email.dto';

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

  show = async (req: Request<{ id: string }>, res: Response) => {
    const { userId } = req.user;
    const emailId = Number(req.params.id);

    const email = await this.emailService.findOneWithBody(emailId, userId);

    if (!email) {
      throw new NotFoundError('Email not found');
    }

    const updatedEmail = await this.emailService.markAsRead(email.id);

    if (!updatedEmail) {
      throw new NotFoundError('Email not found');
    }

    return apiResponse({
      res,
      data: {
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
      },
      message: 'Email fetched successfully',
      status: 200,
    });
  };

  labels = async (req: Request, res: Response) => {
    const credentials = req.session.credentials;

    if (!credentials) {
      throw new NotFoundError('No OAuth2 credentials found');
    }

    const response = await this.emailService.fetchLabels(credentials);

    return apiResponse({
      res,
      data: { labels: response.data.labels || [] },
      message: 'Labels fetched successfully',
      status: 200,
    });
  };
}
