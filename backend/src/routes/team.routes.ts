// src/routes/team.routes.ts
import express, { RequestHandler } from 'express';
import { registerTeamMember, loginTeamMember } from '../controllers/teamAuth.controller';

const router = express.Router();

// Team member authentication routes
router.post('/:teamName/auth/register', registerTeamMember as RequestHandler);
router.post('/:teamName/auth/login', loginTeamMember as RequestHandler);

export default router;