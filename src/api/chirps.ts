import { NextFunction, Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json";
import {
  createChirp,
  deleteChirp,
  getChirp,
  getChirps,
} from "../db/queries/chirps";
import { NewChirp } from "../db/schema";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";
import { getBearerToken, validateJWT } from "./auth";
import { config } from "../config";
import { getRefreshToken } from "../db/queries/refresh_tokens";

export function handlerChirpValidate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.body.body) {
      throw Error(
        `Something went wrong. Ensure the JSON includes a "body" field.`,
      );
    }
    const cleanedBody = replaceProfanities(req);
    throwsIfChirpInvalid(cleanedBody);
    respondWithJSON(res, 200, { cleanedBody });
  } catch (error: any) {
    next(error);
  }
}

function throwsIfChirpInvalid(chirp: string) {
  const MAX_CHAR_LENGTH = 140;
  if (chirp.length > MAX_CHAR_LENGTH) {
    throw new BadRequestError("Chirp is too long");
  }
}

function replaceProfanities(req: Request) {
  const PROFANITIES = new Set(["kerfuffle", "sharbert", "fornax"]);
  const REPLACEMENT = "****";
  let cleanedBody = [];
  let words = req.body.body.split(" ");
  for (let word of words) {
    cleanedBody.push(PROFANITIES.has(word.toLowerCase()) ? REPLACEMENT : word);
  }

  return cleanedBody.join(" ");
}

export async function handlerCreateChirp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getBearerToken(req);
  try {
    const userID = validateJWT(token, config.auth.secret);
    // const refreshToken = await getRefreshToken(token);
    // const userID = refreshToken.userId;
    const cleanedBody = replaceProfanities(req);
    throwsIfChirpInvalid(cleanedBody);

    const chirp: NewChirp = {
      body: req.body.body,
      userId: userID,
    };
    const result = await createChirp(chirp);
    respondWithJSON(res, 201, result);
  } catch (error) {
    next(error);
  }
}

export async function handlerGetChirps(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const results = await getChirps();
    respondWithJSON(res, 200, results);
  } catch (error) {
    next(error);
  }
}

export async function handlerGetChirp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // @ts-ignore
  let chirpId: string = req.params.chirpId;
  try {
    const results = await getChirp(chirpId);
    if (results) {
      respondWithJSON(res, 200, results);
      return;
    } else {
      respondWithError(res, 404, "Not Found");
      return;
    }
  } catch (error: any) {
    next(error);
  }
}

export async function handlerDeleteChirp(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const bearerToken = getBearerToken(req);

  // @ts-ignore
  let chirpId: string = req.params.chirpId;
  try {
    const userID = validateJWT(bearerToken, config.auth.secret);
    const chirp = await getChirp(chirpId);

    // does this chirp belong to this user?
    if (userID != chirp.userId) {
      throw new UserForbiddenError("Forbidden");
    }

    const results = await deleteChirp({ id: chirpId, userId: userID });
    if (results.length == 0) {
      throw new NotFoundError("Not Found");
    }

    return respondWithJSON(res, 204, {});
  } catch (error: any) {
    next(error);
  }
}
