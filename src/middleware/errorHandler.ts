import type { NextFunction, Request, Response } from "express";
import chalk from "chalk";
import { env } from "../config/env.js";

export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unknown error";

  console.error(chalk.red(`[ ERROR ] ${status} — ${message}`));

  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : message,
    // Never leak internals in production.
    ...(env.isProduction || !(error instanceof Error)
      ? {}
      : { stack: error.stack }),
  });
}
