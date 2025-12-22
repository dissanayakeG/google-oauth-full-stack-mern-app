import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
});

// Optional type helper
export type CreateUserDTO = z.infer<typeof createUserSchema>;