import { Router } from "express";
import oAuthRoutes from "./auth.routes";
import testRoutes from "./test";
import emailRoutes from "./email.routes";
import jwtAuth from "../../middlewares/jwt.auth";

const routerV1 = Router();

routerV1.use('/test', testRoutes);
routerV1.use('/auth', oAuthRoutes);
routerV1.use('/email', jwtAuth, emailRoutes);

export default routerV1;