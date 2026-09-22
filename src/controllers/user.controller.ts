import type { Request, Response } from "express";
import { getUsers, DEFAULT_USER_LIMIT } from "../services/user.service.js";

export async function listUsers(req: Request, res: Response): Promise<void> {
  const rawLimit = req.query.limit;
  const parsedLimit =
    typeof rawLimit === "string" && rawLimit.trim() !== ""
      ? Number(rawLimit)
      : DEFAULT_USER_LIMIT;

  const users = await getUsers(parsedLimit);

  res.status(200).json(users);
}
