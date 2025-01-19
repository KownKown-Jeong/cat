// src/routes/chatRoutes.ts
import express, { RequestHandler } from 'express';
import { createOrUpdateChat, getChatHistory, summarizeChat } from '../controllers/chat.controller';
import { authenticateTeamMember } from '../middlewares/auth';

const router = express.Router();

// 팀 채팅 라우트
router.post('/:teamName/chat', authenticateTeamMember, createOrUpdateChat as RequestHandler);
router.get('/:teamName/chat/history', authenticateTeamMember, getChatHistory as RequestHandler);
router.post('/:teamName/chat/:chatId/summarize', authenticateTeamMember, summarizeChat as RequestHandler);

export default router;