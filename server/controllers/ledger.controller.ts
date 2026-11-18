import type { NextFunction, Request, Response } from 'express';
import { getLedgerEntries, verifyLedgerConsistency } from '../services/ledger.service';
import { ledgerQuerySchema } from '../validators/ledger.validator';

export async function getLedgerSummaryController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await verifyLedgerConsistency();
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function listLedgerEntriesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = ledgerQuerySchema.parse(req.query);
    const entries = await getLedgerEntries(filters);
    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
}
