import { Router } from "express";
import { TestController } from "../../controllers/test.controller";
import { validate } from "../../middlewares/request.validate";
import { createUserSchema } from "../../dtos/user.dto";

const testController = new TestController();

const router = Router();

router.post('/test-route', validate(createUserSchema), testController.testMethod);

export default router;