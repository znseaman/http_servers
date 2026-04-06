import { Request, Response } from "express";
import { config } from "./config";

export function handlerMetrics(_: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${config.fileServerHits}`);
}
