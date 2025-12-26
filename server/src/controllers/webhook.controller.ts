import { Request, Response } from 'express';
import { EmailSyncService } from '@/services/emails-sync.service';
import { apiResponse } from '@/utils/api.response';

export class WebhookController {
  private emailSyncService = new EmailSyncService();

  receiveGmailPush = (req: Request, res: Response) => {
    const message = req.body.message?.data;

    if (!message) {
      return apiResponse({ res, data: null, message: 'No message data', status: 204 });
    }

    const decoded = JSON.parse(Buffer.from(message, 'base64').toString('utf8'));
    this.emailSyncService.syncGmailHistory(decoded.emailAddress, decoded.historyId);

    return apiResponse({ res, data: null, message: 'Webhook received', status: 204 });
  };
}
