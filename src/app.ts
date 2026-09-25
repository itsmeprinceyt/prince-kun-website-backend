import express, { type Express } from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { pool } from "./config/db.js";
import { userRouter } from "./routes/user.route.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      res.status(200).json({ status: "ok", uptime: process.uptime() });
    } catch {
      res
        .status(503)
        .json({ status: "degraded", reason: "database unreachable" });
    }
  });

  app.use("/api/users", userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
