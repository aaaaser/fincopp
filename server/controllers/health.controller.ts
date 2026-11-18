import type { NextFunction, Request, Response } from 'express';
import { getSystemHealthStatus } from '../services/health.service';

export async function getHealth(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = await getSystemHealthStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
}
