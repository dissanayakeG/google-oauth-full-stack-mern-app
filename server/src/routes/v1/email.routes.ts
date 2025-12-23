import { Router } from "express";
import { EmailController } from "../../controllers/email.controller";
import jwtAuth from "../../middlewares/jwt.auth";

const router = Router();

const emailController = new EmailController();

router.get('/labels', jwtAuth, emailController.getGmailLabels);
router.get('/emails', jwtAuth, emailController.getGmailEmails);

export default router;