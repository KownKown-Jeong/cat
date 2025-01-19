import express, { RequestHandler } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
} from "../controllers/user.controller";
import { auth, adminOnly } from "../middlewares/auth";

const router = express.Router();

// 관리자 전용 라우트
router.get("/", auth, adminOnly, getAllUsers as RequestHandler);
router.get("/:id", auth, adminOnly, getUserById as RequestHandler);
router.put("/:id", auth, adminOnly, updateUser as RequestHandler);
router.delete("/:id", auth, adminOnly, deleteUser as RequestHandler);
router.patch("/:id/role", auth, adminOnly, updateUserRole as RequestHandler);

export default router;
