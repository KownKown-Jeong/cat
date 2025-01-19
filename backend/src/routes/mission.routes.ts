// src/routes/mission.routes.ts
import express, { RequestHandler } from 'express';
import { auth, adminOnly } from '../middlewares/auth';
import { 
    createMission, getMissions, getMissionById, updateMission, deleteMission 
  } from '../controllers/mission.controller';

  const router = express.Router();

// 관리자 전용 라우트
router.post('/', auth, adminOnly, createMission as RequestHandler);
router.put('/:id', auth, adminOnly, updateMission as RequestHandler);
router.delete('/:id', auth, adminOnly, deleteMission as RequestHandler);

// 일반 사용자 라우트
router.get('/', auth, getMissions as RequestHandler);
router.get('/:id', auth, getMissionById as RequestHandler);
export default router;