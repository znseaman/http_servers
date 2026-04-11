import argon2 from "argon2";
import { getUser } from "../db/queries/users";
import { respondWithError, respondWithJSON } from "./json";
import { NewUser } from "../db/schema";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../config";
import { randomBytes } from "node:crypto";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh_tokens";
import { UserNotAuthenticatedError } from "./errors";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

type UserResponse = Omit<NewUser, "hashedPassword"> & {
  token: string;
  refreshToken: string;
};

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return await argon2.verify(hash, password);
}

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
  now: number,
): string {
  const iat = Math.floor(now / 1000);
  const obj = {
    iss: "chirpy",
    sub: userID,
    iat: iat,
    exp: iat + expiresIn,
  } satisfies payload;
  return jwt.sign(obj, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  const token = jwt.verify(tokenString, secret);
  // @ts-ignore
  return token?.sub;
}

export function getBearerToken(req: Request): string {
  return req.get("Authorization")?.replaceAll("Bearer ", "") || "";
}

export function makeRefreshToken() {
  return randomBytes(32).toString("hex");
}

export async function handlerLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  type parameters = {
    email: string;
    password: string;
  };

  // @ts-ignore
  const params: parameters = req.body;

  if (!params.email) throw Error("Nah cuz");
  if (!params.password) throw Error("Nah cuz");

  const MAX_EXPIRATION_TIME = 60 * 60 * 1000;
  const MAX_REFRESH_TOKEN_EXPIRATION_TIME = 60 * 24 * 60 * 60 * 1000;

  try {
    let user = await getUser(params.email);
    let hasPasswordMatch = await checkPasswordHash(
      params.password,
      // @ts-ignore
      user.hashed_password,
    );
    if (hasPasswordMatch) {
      const now = Date.now();
      const token = makeJWT(
        user.id,
        MAX_EXPIRATION_TIME,
        config.auth.secret,
        now,
      );
      const refreshToken = await createRefreshToken({
        token: makeRefreshToken(),
        userId: user.id,
        expiresAt: new Date(now + MAX_REFRESH_TOKEN_EXPIRATION_TIME),
      });
      // @ts-ignore
      respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        isChirpyRed: user.isChirpyRed,
        token: token,
        refreshToken: refreshToken.token,
      } satisfies UserResponse);
    } else {
      // @ts-ignore
      respondWithError(res, 401, "Unauthorized");
    }
  } catch (error) {
    next(error);
  }

  return;
}

export async function handlerRefresh(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const bearerToken = getBearerToken(req);

  try {
    const refreshToken = await getRefreshToken(bearerToken);
    if (!refreshToken) {
      throw new UserNotAuthenticatedError(
        "Invalid refresh token. Log back in to get a new refresh token.",
      );
    }

    // create a new token to return
    const MAX_EXPIRATION_TIME = 60 * 60 * 1000;
    const now = Date.now();
    const accessToken = makeJWT(
      refreshToken.userId,
      MAX_EXPIRATION_TIME,
      config.auth.secret,
      now,
    );

    respondWithJSON(res, 200, { token: accessToken });
  } catch (error) {
    next(error);
  }
}

export async function handlerRevoke(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const bearerToken = getBearerToken(req);

  try {
    const revokedAt = await revokeRefreshToken(bearerToken);
    if (!revokedAt) {
      throw new UserNotAuthenticatedError(
        "Invalid refresh token. Log back in to get a new refresh token.",
      );
    }

    respondWithJSON(res, 204, {});
  } catch (error) {
    next(error);
  }
}

export function getAPIKey(req: Request): string {
  return req.get("Authorization")?.replaceAll("ApiKey ", "") || "";
}
