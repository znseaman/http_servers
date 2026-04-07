import { NextFunction, Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json";

type ChirpRequest = {
  body: string;
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
    // respondWithError(res, 400, error.message);
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
