import { Request, Response } from 'express';
import { EmailSyncService } from '@/services/email-sync.service';

export class WebhookController {
  private emailSyncService = new EmailSyncService();

  /**
   * listen to gmail push notifications and sync db
   */
  handleGmailWebhooks = (req: Request, res: Response) => {
    res.sendStatus(204);
    const message = req.body.message?.data;
    if (!message) return;
    const decoded = JSON.parse(Buffer.from(message, 'base64').toString('utf8'));
    this.emailSyncService.syncGmailHistory(decoded.emailAddress, decoded.historyId);
  };
}
