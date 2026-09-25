import type { RowDataPacket } from "mysql2";
import { pool } from "../config/db.js";
import type { DbUser, UserWithUsername } from "../types/user.js";
import { fetchDiscordUsername } from "./discord.service.js";

export const DEFAULT_USER_LIMIT = 20;
export const MAX_USER_LIMIT = 100;

/** Clamps an arbitrary number into a safe SQL LIMIT value. */
function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_USER_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_USER_LIMIT);
}

export async function getUsers(
  limit: number = DEFAULT_USER_LIMIT,
): Promise<UserWithUsername[]> {
  const safeLimit = normalizeLimit(limit);

  const [rows] = await pool.query<DbUser[]>(
    "SELECT user_id, pp_cash, refer_tickets, total_purchases, total_referred, spv FROM users LIMIT ?",
    [safeLimit],
  );

  const users = await Promise.all(
    rows.map(async (user): Promise<UserWithUsername> => {
      const username = await fetchDiscordUsername(user.user_id);
      return { ...user, username: username ?? "Unknown" };
    }),
  );

  return users;
}

/** Convenience re-export so services stay the only place that touches the pool. */
export type { RowDataPacket };
