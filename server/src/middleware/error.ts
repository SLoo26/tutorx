import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';

/** Throwable error carrying an HTTP status code. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Wrap an async route so rejected promises reach the error handler. */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.issues });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
