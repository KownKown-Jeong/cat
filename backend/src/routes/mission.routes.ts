// src/routes/mission.routes.ts
import express, { RequestHandler } from "express";
import { auth, adminOnly } from "../middlewares/auth";
import {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  deleteMission,
  startMissionChat,
  continueMissionChat,
  completeMission,
} from "../controllers/mission.controller";

const router = express.Router();

// 관리자 전용 라우트
router.post("/", auth, adminOnly, createMission as RequestHandler);
router.put("/:id", auth, adminOnly, updateMission as RequestHandler);
router.delete("/:id", auth, adminOnly, deleteMission as RequestHandler);

// 일반 사용자 라우트
router.get("/", auth, getMissions as RequestHandler);
router.get("/:id", auth, getMissionById as RequestHandler);

// 미션 채팅 관련 라우트
router.post("/:id/chat/start", auth, startMissionChat as RequestHandler);
router.post("/:id/chat/continue", auth, continueMissionChat as RequestHandler);
router.post("/:id/complete", auth, completeMission as RequestHandler);

export default router;
