// src/routes/auth.routes.ts
import express, { RequestHandler } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);

export default router;

