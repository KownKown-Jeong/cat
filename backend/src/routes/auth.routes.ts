// src/routes/auth.routes.ts
import express, { RequestHandler } from "express";
import {
  register,
  login,
  initiateAuth,
  //verifyEmail,
  //verifyToken,
} from "../controllers/auth.controller";

const router = express.Router();

// 일반 인증 라우트
router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);

// 팀 인증 라우트
router.post("/:teamName/register", register as RequestHandler);
router.post("/:teamName/login", login as RequestHandler);
router.post("/:teamName/initiate-auth", initiateAuth as RequestHandler);
//router.get("/verify-email", verifyEmail as RequestHandler);
//router.post("/verify-token", verifyToken as RequestHandler);

export default router;
