import { Request, Response } from "express";
import { createUser, deleteUsers, updateUser } from "../db/queries/users";
import { respondWithJSON } from "./json";
import { getBearerToken, hashPassword, validateJWT } from "./auth";
import { NewUser } from "../db/schema";
import { config } from "../config";

type UserResponse = Omit<NewUser, "hashedPassword" | "hashed_password">;

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
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
  return;
}

export async function handlerDeleteUsers(req: Request, res: Response) {
  await deleteUsers();
  respondWithJSON(res, 200, "OK");
  return;
}

export async function handlerUpdateUser(req: Request, res: Response) {
  // get bearer token
  const bearerToken = getBearerToken(req);

  const user = {
    id: validateJWT(bearerToken, config.auth.secret), // authenticate user using the access token
    email: req.body.email,
    hashed_password: await hashPassword(req.body.password),
  } satisfies NewUser;

  // update user and return updated user
  const updatedUser = await updateUser(user);

  respondWithJSON(res, 200, {
    id: updatedUser.id,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    email: updatedUser.email,
    isChirpyRed: updatedUser.isChirpyRed,
  } satisfies UserResponse);
}
