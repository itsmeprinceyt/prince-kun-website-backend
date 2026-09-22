import { Router } from "express";
import { listUsers } from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRouter: Router = Router();

userRouter.get("/", asyncHandler(listUsers));
