import type { Server } from "node:http";
import chalk from "chalk";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDB, initDB } from "./config/db.js";

async function bootstrap(): Promise<void> {
  await initDB();

  const app = createApp();

  const server: Server = app.listen(env.serverPort, () => {
    console.log(
      chalk.cyan(
        `[ SERVER ] 🚀 Backend running on http://localhost:${env.serverPort} (${env.nodeEnv})`,
      ),
    );
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(
      chalk.yellow(
        `\n[ SERVER ] ${signal} received — shutting down gracefully...`,
      ),
    );

    server.close(() => {
      void closeDB()
        .then(() => process.exit(0))
        .catch((error: unknown) => {
          console.error(chalk.red("[ SERVER ] Error while closing DB:"), error);
          process.exit(1);
        });
    });

    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  process.on("unhandledRejection", (reason) => {
    console.error(chalk.red("[ PROCESS ] Unhandled rejection:"), reason);
  });

  process.on("uncaughtException", (error) => {
    console.error(chalk.red("[ PROCESS ] Uncaught exception:"), error);
    process.exit(1);
  });
}

bootstrap().catch((error: unknown) => {
  console.error(chalk.red("[ SERVER ] ❌ Failed to start:"), error);
  process.exit(1);
});
