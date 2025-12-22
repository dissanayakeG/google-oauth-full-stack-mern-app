import { Request, Response, Router } from "express";
import { CreateUserDTO, createUserSchema } from "../../dtos/user.dto";
import { User } from "../../models/user";

const router = Router();

router.post('/add-user', async (req: Request<{}, {}, CreateUserDTO>, res: Response) => {

    console.log('qqqqqqq');


    try {
        const { name, email } = req.body;

        const parsedBody: CreateUserDTO = createUserSchema.parse(req.body);

        const newUser = await User.create(parsedBody);

        res.status(201).json({ message: 'User added', user: newUser });
    } catch (err) {
        if (err instanceof Error) {
            // Zod validation error
            if ('errors' in err) {
                return res.status(400).json({ message: 'Validation failed', errors: err.errors });
            }
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
})

export default router;