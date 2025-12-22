import { z } from 'zod';

export const createUserSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    picture: z.string().url().optional()
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;