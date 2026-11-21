import { z } from 'zod'

export const productResponseSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().int().nonnegative(),
    currency: z.string().length(3),
  })
  .strict()
