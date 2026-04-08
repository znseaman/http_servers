import { NextFunction, Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json";
import { createChirp, getChirps } from "../db/queries/chirps";
import { uuid } from "drizzle-orm/pg-core";
import { NewChirp } from "../db/schema";

type ChirpRequest = {
  body: string;
  userId: string;
};

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
    throw Error("Chirp is too long");
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
  try {
    if (!req.body.body || !req.body.userId) {
      throw Error(
        `Something went wrong. Ensure the JSON includes a "body" and "userId" fields.`,
      );
    }
    const cleanedBody = replaceProfanities(req);
    throwsIfChirpInvalid(cleanedBody);

    const chirp: NewChirp = {
      body: req.body.body,
      user_id: req.body.userId,
    };
    const result = await createChirp(chirp);
    respondWithJSON(res, 201, { body: chirp.body, userId: chirp.user_id });
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
