import { UnauthorizedError } from "../errors/UnauthorizedError";
import { EmailService } from "../services/email.service";
import { logger } from "../utils/logger";
import { NextFunction, Request, Response } from "express";


export class EmailController {

    private emailService = new EmailService();

    getGmailLabels = async (req: Request, res: Response, next: NextFunction) => {

        const user = req.user;

        if (!user || typeof user === 'string') {
            throw new UnauthorizedError('No refresh token provided');
        }

        const userId = (user as any).userId;
        if (!userId) {
            throw new UnauthorizedError('Unauthorized: User ID missing');
        }

        const credentials = req.session?.credentials;
        if (!credentials) {
            throw new UnauthorizedError('No OAuth2 credentials found');
        }

        const response = await this.emailService.fetchGmailLabels(credentials);
        const labels = response.data.labels || [];

        res.json({ labels });
    }


    /**
     * Get a single email with body by ID
     */
    getEmailById = async (req: Request, res: Response, next: NextFunction) => {

        const user = req.user as { userId: string };
        const emailId = parseInt(req.params.id);

        if (!user || !user.userId) {
            throw new UnauthorizedError();
        }

        if (isNaN(emailId)) {
            return res.status(400).json({ message: 'Invalid email ID' });
        }

        const email = await this.emailService.getEmailBody(emailId, user.userId);
        res.json({ email });
    }

    /**
     * get all user emails from db
     */
    listUserEmails = async (req: Request, res: Response, next: NextFunction) => {

        const user = req.user as { userId: string };
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!user || !user.userId) {
            throw new UnauthorizedError();
        }

        const emails = await this.emailService.getUserEmails(user.userId, limit, offset);
        res.json({ emails, limit, offset });
    }

    /**
     * listen to gmail push notifications and sync db
     */
    handleGmailPushNotification = (req: Request, res: Response, next: NextFunction) => {
        res.sendStatus(204); // acknowledge immediately

        const message = req.body.message?.data;
        if (!message) return;

        const decoded = JSON.parse(Buffer.from(message, 'base64').toString('utf8'));
        console.log('step 5: handleGmailPushNotification 😈😈😈😈😈😈😈😈😈😈😈😈');
        this.emailService.syncGmailHistory(decoded.emailAddress, decoded.historyId);
    }
}