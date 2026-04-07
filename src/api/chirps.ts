import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json";

type ChirpRequest = {
  body: string;
};

export function handlerChirpValidate(req: Request, res: Response) {
  try {
    const returnData = isChirpValid(req);
    respondWithJSON(res, 200, returnData);
  } catch (error: any) {
    respondWithError(res, 400, error.message);
  }
}

function isChirpValid(req: Request) {
  let params: ChirpRequest = req.body;

  const MAX_CHAR_LENGTH = 140;
  if (params?.body?.length > MAX_CHAR_LENGTH) {
    throw Error("Chirp is too long");
  }
  if (params?.body?.length <= MAX_CHAR_LENGTH) {
    return { valid: true };
  }
  throw Error(`Something went wrong. Ensure the JSON includes a "body" field.`);
}
