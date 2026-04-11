import { NextFunction, Request, Response } from "express";
import { setChirpyRedStatus } from "../db/queries/users";
import { respondWithJSON } from "./json";
import { NotFoundError, UserNotAuthenticatedError } from "./errors";
import { getAPIKey } from "./auth";
import { config } from "../config";

export async function handlerWebhooks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKey = getAPIKey(req);
  if (apiKey != config.api.polkaKey)
    return next(new UserNotAuthenticatedError("Invalid API Key"));
  if (req.body.event == "user.upgraded") {
    const result = await setChirpyRedStatus({
      id: req.body.data.userId,
      isChirpyRed: true,
    });
    if (result) return respondWithJSON(res, 204, {});
    return next(new NotFoundError("Not Found"));
  }

  return respondWithJSON(res, 204, {});
}
