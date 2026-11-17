import { z } from 'zod'

export const authRequestSchema = z
  .object({
    identifier: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .strict()
