import { createOAuth2Client } from '../config/google.config';
import { Auth, google } from 'googleapis';
import { Email } from '../models/email';
import { EmailBody } from '../models/emailBody';
import { Op, WhereOptions } from 'sequelize';

export class EmailService {

    private oauth2Client = createOAuth2Client();

    fetchGmailLabels = (credentials: Auth.Credentials) => {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail.users.labels.list({ userId: 'me' });
    }

    //get from db
    async getUserEmails(
        userId: string,
        limit: number = 20,
        offset: number = 0,
        filters?: { search?: string; isRead?: boolean }
    ) {
        const where: WhereOptions = { userId };

        if (filters?.search) {
            const searchPattern = `%${filters.search}%`;
            where[Op.or as any] = [
                { subject: { [Op.like]: searchPattern } },
                { sender: { [Op.like]: searchPattern } },
                { snippet: { [Op.like]: searchPattern } }
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
            raw: true //faster queries without model instances
        });

        // return {
        //     emails: rows,
        //     pagination: {
        //         total: count,
        //         limit,
        //         offset,
        //         hasMore: count > offset + limit
        //     }
        // };

        return {
            emails: rows.map(email => ({
                id: email.id,
                subject: email.subject,
                sender: email.sender,
                snippet: email.snippet,
                isRead: email.isRead,
                dateReceived: email.dateReceived
            })),
            total: count
        };
    }

    async getEmailBody(emailId: number, userId: string) {
        const email = await Email.findOne({
            where: { id: emailId, userId },
            include: [{
                model: EmailBody,
                as: 'body',
                attributes: ['html', 'text']
            }]
        }) as (Email & { body?: EmailBody }) | null;

        return email;
    }

    async markEmailAsRead(emailId: number) {

        await Email.update(
            { isRead: true },
            { where: { id: emailId } }
        );

        return await Email.findByPk(emailId, {
            include: [{
                model: EmailBody,
                as: 'body'
            }]
        });
    }
}
