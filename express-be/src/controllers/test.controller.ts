import { NextFunction, Request, Response, Router } from "express";
import { CreateUserDTO, createUserSchema } from "../dtos/user.dto";
import { TestService } from "../services/test.service";

export class TestController {

    private testService = new TestService();

    testMethod = async (req: Request<{}, {}, CreateUserDTO>, res: Response) => {

        const newUser = await this.testService.addUser(req.body);

        res.status(201).json({ message: 'User added', user: newUser });
    }
}