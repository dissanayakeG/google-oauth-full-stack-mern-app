import { Router } from "express";

import { TestController } from "../../controllers/test.controller";

const testController = new TestController();

const router = Router();

router.post('/test-route', testController.testMethod);
export default router;