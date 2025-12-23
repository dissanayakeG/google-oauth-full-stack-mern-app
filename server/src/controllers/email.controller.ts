import { EmailService } from "../services/email.service";
import { logger } from "../utils/logger";
import { NextFunction, Request, Response } from "express";


export class EmailController {

    private emailService = new EmailService();


    getGmailLabels = async (req: Request, res: Response, next: NextFunction) => {
        logger.info('getGmailLabels hit!');
        try {
            const user = req.user;

            if (!user || typeof user === 'string') {
                logger.info({ user }, 'No valid user payload');
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userId = (user as any).userId;
            if (!userId) {
                logger.info({ user }, 'No userId in payload');
                return res.status(401).json({ message: 'Unauthorized: User ID missing' });
            }

            const credentials = req.session?.credentials;
            if (!credentials) {
                logger.info('no credentials');
                return res.status(401).json({ message: 'No OAuth2 credentials found' });
            }

            const response = await this.emailService.fetchGmailLabels(credentials);
            const labels = response.data.labels || [];

            logger.info('Gmail labels fetched successfully');
            res.json({ labels });

        } catch (error) {
            logger.error(`Error fetching Gmail labels: ${error}`);
            res.status(500).json({ message: 'Failed to fetch Gmail labels' });
        }
    }

    getGmailEmails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as { userId: string; email: string };

            if (!user || !user.email) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const googleAccessToken = req.session?.credentials?.access_token;

            if (!googleAccessToken) {
                return res.status(401).json({ message: 'No Google OAuth access token found in session' });
            }

            const emails = await this.emailService.fetchEmailsViaIMAP(googleAccessToken, user.email);
            res.json({ emails });

        } catch (error: any) {
            logger.error(`Error fetching Gmail emails: ${error}`);

            if (error.message.includes('AUTHENTICATIONFAILED')) {
                return res.status(401).json({ message: 'Token expired' });
            }

            res.status(500).json({ message: 'Failed to fetch Gmail emails' });
        }
    }
}