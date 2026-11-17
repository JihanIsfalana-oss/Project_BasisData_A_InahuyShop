import { z } from 'zod'

export const checkoutRequestSchema = z
  .object({
    items: z.array(
      z
        .object({
          variantId: z.string().min(1),
          quantity: z.number().int().positive(),
        })
        .strict(),
    ),
  })
  .strict()
