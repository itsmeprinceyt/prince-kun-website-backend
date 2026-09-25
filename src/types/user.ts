import type { RowDataPacket } from "mysql2";

/** Raw row shape returned by the `users` table. */
export interface DbUser extends RowDataPacket {
  user_id: string;
  pp_cash: number;
  refer_tickets: number;
  total_purchases: number;
  total_referred: number;
  spv: number;
}

/** What the API actually returns. */
export interface UserWithUsername extends DbUser {
  username: string;
}

/** Subset of the Discord user object we care about. */
export interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
}
