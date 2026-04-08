import { Request, Response } from "express";
import { createUser, deleteUsers } from "../db/queries/users";
import { respondWithError, respondWithJSON } from "./json";
import { config } from "../config";

export async function handlerCreateUser(req: Request, res: Response) {
  if (!req.body.email) throw Error(`Missing "email" field in the request body`);

  const user = await createUser({ email: req.body.email });
  respondWithJSON(res, 201, user);
  return;
}

export async function handlerDeleteUsers(req: Request, res: Response) {
  console.log(`platform: ${config.api.platform}`);
  //   if (config.api.platform != "dev") {
  //     respondWithError(res, 403, "Forbidden");
  //     return;
  //   }

  await deleteUsers();

  respondWithJSON(res, 200, "OK");
  return;
}
