import { Request, Response, NextFunction } from "express";
import { config } from "../config";

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
