import { type Request, Response } from 'express';

export function log(...args: any[]) {
  console.log(...args);
}

export function logRequest(req: Request, res: Response, duration: number) {
  console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
}

export function logError(error: Error | unknown) {
  console.error('Error:', error instanceof Error ? error.message : error);
}
