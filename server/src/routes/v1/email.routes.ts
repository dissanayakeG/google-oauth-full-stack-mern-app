import { Router } from "express";
import { EmailController } from "../../controllers/email.controller";

const router = Router();

const emailController = new EmailController();

router.get('/labels', emailController.getGmailLabels);
router.get('/fetch', emailController.getGmailEmails);
router.get('/list', emailController.listUserEmails);
router.get('/:id', emailController.getEmailById);

export default router;