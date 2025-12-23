import { Router } from "express";
import oAuthRoutes from "./auth.routes";
import testRoutes from "./test";
import emailRoutes from "./email.routes";

const routerV1 = Router();

routerV1.use('/test', testRoutes);
routerV1.use('/auth', oAuthRoutes);
routerV1.use('/email', emailRoutes);

export default routerV1;