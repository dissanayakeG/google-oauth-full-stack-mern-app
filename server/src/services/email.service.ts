import { logger } from '../utils/logger';
import { createOAuth2Client } from '../config/google.config';
import { Auth, google } from 'googleapis';
import ImapFlowClient from './support/imap';
import { simpleParser } from 'mailparser';
import { Email } from '../models/email';
import { EmailBody } from '../models/emailBody';
import { Request } from 'express';
import { User } from '../models/user';

export class EmailService {

    private oauth2Client = createOAuth2Client();

    fetchGmailLabels = (credentials: Auth.Credentials) => {
        this.oauth2Client.setCredentials(credentials);
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail.users.labels.list({ userId: 'me' });
    }

    //get from db
    async getUserEmails(userId: string, limit: number = 50, offset: number = 0) {
        const emails = await Email.findAll({
            where: { userId },
            attributes: ['id', 'subject', 'sender', 'snippet', 'isRead', 'dateReceived'],
            order: [['dateReceived', 'DESC']],
            limit,
            offset
        });

        return emails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.sender,
            snippet: email.snippet,
            date: email.dateReceived,
            unseen: !email.isRead
        }));
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

        if (!email) {
            throw new Error('Email not found');
        }

        // Mark as read
        if (!email.isRead) {
            await email.update({ isRead: true });
        }

        return {
            id: email.id,
            subject: email.subject,
            sender: email.sender,
            recipient: email.recipient,
            date: email.dateReceived,
            isRead: email.isRead,
            body: {
                html: email.body?.html || '',
                text: email.body?.text || ''
            }
        };
    }

}
