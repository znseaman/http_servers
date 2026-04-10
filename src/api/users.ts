import { Request, Response } from "express";
import { createUser, deleteUsers } from "../db/queries/users";
import { respondWithJSON } from "./json";
import { hashPassword } from "./auth";
import { NewUser } from "../db/schema";

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
  if (!req.body.email) throw Error(`Missing "email" field in the request body`);
  if (!req.body.password)
    throw Error(`Missing "password" field in the request body`);

  const user = await createUser({
    email: req.body.email,
    hashed_password: await hashPassword(req.body.password),
  } satisfies NewUser);

  respondWithJSON(res, 201, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  } satisfies UserResponse);
  return;
}

export async function handlerDeleteUsers(req: Request, res: Response) {
  await deleteUsers();
  respondWithJSON(res, 200, "OK");
  return;
}
