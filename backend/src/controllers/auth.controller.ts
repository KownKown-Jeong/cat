// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { TeamMember } from '../models/TeamMember';
import { sendAuthEmail } from '../utils/emailService';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, isAdmin, team } = req.body;

    // 기존 사용자 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const user = new User({
      username,
      password: hashedPassword,
      isAdmin,
      team
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const initiateAuth = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { teamName } = req.params;

    // 이메일 발송
    const token = await sendAuthEmail(email, teamName);

    // 임시 사용자 생성 또는 업데이트
    await TeamMember.findOneAndUpdate(
      { email, teamName },
      { email, teamName, lastLoginAttempt: new Date() },
      { upsert: true }
    );

    res.json({ 
      message: '인증 이메일이 발송되었습니다.',
      email 
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

export const verifyAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    // 토큰 검증
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!);
    const { email, teamName } = decoded as { email: string; teamName: string };

    // 영구 토큰 생성 (자동 로그인용)
    const permanentToken = jwt.sign(
      { email, teamName },
      process.env.JWT_SECRET!,
      { expiresIn: '365d' }  // 1년
    );

    res.json({
      message: '인증이 완료되었습니다.',
      token: permanentToken,
      user: { email, teamName }
    });
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 인증입니다.' });
  }
};

