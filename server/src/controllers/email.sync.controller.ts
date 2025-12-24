import { NextFunction, Request, Response } from "express";
import { EmailSyncService } from "../services/email.sync.service";

export class EmailSyncController {
    private emailSyncService = new EmailSyncService();

    /**
     * listen to gmail push notifications and sync db
     */
    handleGmailPushNotification = (req: Request, res: Response, next: NextFunction) => {
        res.sendStatus(204);
        const message = req.body.message?.data;
        if (!message) return;
        const decoded = JSON.parse(Buffer.from(message, 'base64').toString('utf8'));
        this.emailSyncService.syncGmailHistory(decoded.emailAddress, decoded.historyId);
    }
}