import { Request, Response } from "express";

export class AuthController {

    constructor(){}

    login(req: Request, res: Response){

        console.log('Login is called');

       res.send("Login");

    }
    
}