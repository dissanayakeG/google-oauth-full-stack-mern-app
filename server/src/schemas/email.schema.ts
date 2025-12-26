import { z } from 'zod';

export const querySchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
});

export type GetAllEmailsRequestQueryDTO = z.infer<typeof querySchema>;
