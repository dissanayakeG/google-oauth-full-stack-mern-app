import { UnauthorizedError } from '@/errors/UnauthorizedError';
import { EmailService } from '@/services/email.service';
import { Request, Response } from 'express';
import { NotFoundError } from '@/errors/NotFoundError';
import { JwtPayload } from 'jsonwebtoken';

export class EmailController {
  private emailService = new EmailService();

  getGmailLabels = async (req: Request, res: Response) => {
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
    //todo : douche check this credintials, do i init googe oauth?

    const response = await this.emailService.fetchGmailLabels(credentials);
    const labels = response.data.labels || [];

    res.json({ labels });
  };

  getEmailById = async (req: Request, res: Response) => {
    const user = req.user as { userId: string };
    const emailId = parseInt(req.params.id);

    if (!user || !user.userId) {
      throw new UnauthorizedError();
    }

    if (isNaN(emailId)) {
      return res.status(400).json({ message: 'Invalid email ID' });
    }

    const email = await this.emailService.getEmailBody(emailId, user.userId);

    if (!email) {
      throw new NotFoundError();
    }

    const updatedEmail = await this.emailService.markEmailAsRead(email.id);

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
    //associate defined in model as body

    res.status(200).json({ data: emailResponse });
  };

  listUserEmails = async (req: Request, res: Response) => {
    const user = req.user as { userId: string };
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || '';
    const isRead = req.query.isRead as string;

    if (!user || !user.userId) {
      throw new UnauthorizedError();
    }

    const filters = {
      search,
      isRead: isRead ? isRead === 'true' : undefined,
    };

    const result = await this.emailService.getUserEmails(user.userId, limit, offset, filters);
    res.json({
      emails: result.emails,
      limit,
      offset,
      total: result.total,
      hasMore: offset + limit < result.total,
    });
  };
}
