import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { respondWithError } from "./json";

export async function middlewareLogResponse(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    if (res.statusCode != 200) {
      console.log(
        `[NON-OK] ${res.req.method} ${res.req.originalUrl} - Status: ${res.statusCode}`,
      );
    }
  });
  next();
}

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  config.fileServerHits++;
  next();
}

export function middlewareHandleErrors(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(`[ERROR] ${err.message} ${err.stack}`);
  respondWithError(res, 500, "Something went wrong on our end");
  return;
}
