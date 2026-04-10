import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { respondWithError } from "./json";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
  UserNotAuthenticatedError,
} from "./errors";
import { JsonWebTokenError } from "jsonwebtoken";

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
  config.api.fileServerHits++;
  next();
}

export function middlewareHandleErrors(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong on our end";

  if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UserNotAuthenticatedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof UserForbiddenError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.log(err.message, err.stack);
  }

  respondWithError(res, statusCode, message);
}
