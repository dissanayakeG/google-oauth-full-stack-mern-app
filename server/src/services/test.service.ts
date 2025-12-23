import { User } from "../config/db.config";
import { CreateUserDTO, createUserSchema } from "../dtos/user.dto";
import { ValidationError } from "../errors/ValidationError";
import { logger } from "../utils/logger";

export class TestService {

    async addUser(data: CreateUserDTO) {

        logger.info({ data }, "TestService addUser called");

        const parsedBody = createUserSchema.safeParse(data);

        if (!parsedBody.success) {
            throw new ValidationError(
                'Validation failed',
                parsedBody.error.errors
            );
        }

        if (data.email != "m@gmail.com") {
            throw new ValidationError("Invalid email provided", []);
        }


        const newUser = await User.create(parsedBody.data);

        return { message: "Service executed successfully", newUser };
    }
}