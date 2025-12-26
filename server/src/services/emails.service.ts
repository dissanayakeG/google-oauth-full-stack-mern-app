import { createOAuth2Client } from '@/config/google.config';
import { Auth, google } from 'googleapis';
import { Email } from '@/models/email';
import { EmailBody } from '@/models/emailBody';
import { Op, WhereOptions } from 'sequelize';

export class EmailService {
  private oauth2Client = createOAuth2Client();

  fetchLabels = (credentials: Auth.Credentials) => {
    this.oauth2Client.setCredentials(credentials);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    return gmail.users.labels.list({ userId: 'me' });
  };

  async findAll(
    userId: string,
    limit: number,
    offset: number,
    filters?: { search?: string; isRead?: boolean }
  ) {
    const where: WhereOptions<Email> = { userId };

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      (where as Record<symbol, unknown>)[Op.or] = [
        { subject: { [Op.like]: searchPattern } },
        { sender: { [Op.like]: searchPattern } },
        { snippet: { [Op.like]: searchPattern } },
      ];
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    const { count, rows } = await Email.findAndCountAll({
      where,
      attributes: ['id', 'subject', 'sender', 'snippet', 'isRead', 'dateReceived'],
      order: [['dateReceived', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    return {
      emails: rows.map((email) => ({
        id: email.id,
        subject: email.subject,
        sender: email.sender,
        snippet: email.snippet,
        isRead: email.isRead,
        dateReceived: email.dateReceived,
      })),
      total: count,
    };
  }

  async findOneWithBody(emailId: number, userId: string) {
    return await Email.findOne({
      where: { id: emailId, userId },
      include: [
        {
          model: EmailBody,
          as: 'body',
          attributes: ['html', 'text'],
        },
      ],
    });
  }

  async markAsRead(emailId: number) {
    await Email.update({ isRead: true }, { where: { id: emailId } });

    return await Email.findByPk(emailId, {
      include: [
        {
          model: EmailBody,
          as: 'body',
        },
      ],
    });
  }
}
