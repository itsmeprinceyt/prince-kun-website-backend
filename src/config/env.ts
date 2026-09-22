import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optionalInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new Error(
      `Environment variable ${name} must be an integer, got "${raw}"`,
    );
  }
  return parsed;
}

function optionalString(name: string, fallback: string): string {
  const raw = process.env[name];
  return raw === undefined || raw.trim() === "" ? fallback : raw.trim();
}

export interface AppEnv {
  readonly nodeEnv: "development" | "production" | "test";
  readonly isProduction: boolean;
  readonly serverPort: number;
  readonly discordBotToken: string;
  readonly db: {
    readonly host: string;
    readonly user: string;
    readonly password: string;
    readonly database: string;
    readonly port: number;
  };
}

const nodeEnv = optionalString("NODE_ENV", "development") as AppEnv["nodeEnv"];

export const env: AppEnv = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  serverPort: optionalInt("SERVER_PORT", 3000),
  discordBotToken: required("DISCORD_BOT_TOKEN"),
  db: {
    host: required("PRODUCTION_DB_HOST"),
    user: required("PRODUCTION_DB_USER"),
    password: required("PRODUCTION_DB_PASS"),
    database: required("PRODUCTION_DB_NAME"),
    port: optionalInt("PRODUCTION_DB_PORT", 3306),
  },
};
