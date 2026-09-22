import mysql, { type Pool, type PoolOptions } from "mysql2/promise";
import chalk from "chalk";
import { env } from "./env.js";

const poolOptions: PoolOptions = {
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
};

export const pool: Pool = mysql.createPool(poolOptions);

export async function initDB(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(
      chalk.green("[ DATABASE ] ✅ Database connected successfully !"),
    );
  } catch (error) {
    console.error(chalk.red("[ DATABASE ] ❌ Connection failed:"), error);
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  await pool.end();
  console.log(chalk.yellow("[ DATABASE ] Connection pool closed."));
}
