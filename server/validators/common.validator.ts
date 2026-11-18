import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('ID harus berupa bilangan bulat positif.'),
});

export const moneyDecimalSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val).trim())
  .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: 'Nominal harus berupa angka positif maksimal 2 angka di belakang koma.',
  })
  .refine((val) => Number(val) > 0, {
    message: 'Nominal harus lebih besar dari Rp0.',
  });

export const isoDateSchema = z
  .string()
  .trim()
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Format tanggal tidak valid.',
  });
