import { NextFunction, Request, Response } from "express";

export async function handlerReadiness(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
  } catch (error) {
    next(error);
  }
}
