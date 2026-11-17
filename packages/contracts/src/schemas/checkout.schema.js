import { z } from 'zod'

export const checkoutRequestSchema = z
  .object({
    addressId: z.number().int().positive().nullable().optional(),
    voucherCode: z.string().max(80).optional(),
  })
  .strict()
