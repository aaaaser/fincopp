import { Router } from 'express';
import {
  getLedgerSummaryController,
  listLedgerEntriesController,
} from '../controllers/ledger.controller';

const router = Router();

router.get('/ledger/summary', getLedgerSummaryController);
router.get('/ledger/entries', listLedgerEntriesController);

export default router;
