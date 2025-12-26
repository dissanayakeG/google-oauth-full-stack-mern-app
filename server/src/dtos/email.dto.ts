import { z } from 'zod';

export const emailsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
});

export const emailIdParamsSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Invalid email ID' }),
});

export type GetAllEmailsRequestQueryDTO = z.infer<typeof emailsQuerySchema>;
export type EmailIdParamsDTO = z.infer<typeof emailIdParamsSchema>;
