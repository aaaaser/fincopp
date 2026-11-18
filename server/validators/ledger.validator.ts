import { CashFlowDirection, LedgerClassification } from '@prisma/client';
import { z } from 'zod';

export const ledgerQuerySchema = z.object({
  walletId: z.coerce.number().int().positive().optional(),
  classification: z.nativeEnum(LedgerClassification).optional(),
  direction: z.nativeEnum(CashFlowDirection).optional(),
  includeVoided: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
