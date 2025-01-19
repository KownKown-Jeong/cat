// src/controllers/team.auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { TeamMember } from '../models/TeamMember';
import { sendAuthEmail } from '../utils/emailService';

export const registerTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { username, password } = req.body;

    // Check if user already exists
    const existingMember = await TeamMember.findOne({ teamName, username });
    if (existingMember) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
    }

    // Create new team member
    const teamMember = new TeamMember({
      teamName,
      username,
      password,
    });

    await teamMember.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: teamMember._id, teamName, username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '계정이 생성되었습니다.',
      token,
      user: {
        id: teamMember._id,
        teamName,
        username,
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

export const loginTeamMember = async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { username, password } = req.body;

    // Find team member
    const teamMember = await TeamMember.findOne({ teamName, username });
    if (!teamMember) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // Verify password
    const isMatch = await teamMember.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // Update last login
    teamMember.lastLogin = new Date();
    await teamMember.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: teamMember._id, teamName, username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: teamMember._id,
        teamName,
        username,
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

export const initiateAuth = async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { email } = req.body;

    // Create or update team member
    const teamMember = await TeamMember.findOneAndUpdate(
      { teamName, email },
      { 
        teamName, 
        email,
        lastLogin: new Date() 
      },
      { upsert: true, new: true }
    );

    // Send verification email
    await sendAuthEmail(email, teamName);

    res.status(200).json({
      message: '인증 이메일이 발송되었습니다.',
      email
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
      email: string;
      teamName: string;
    };

    const teamMember = await TeamMember.findOneAndUpdate(
      { email: decoded.email, teamName: decoded.teamName },
      { verified: true },
      { new: true }
    );

    if (!teamMember) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // Generate permanent token
    const permanentToken = jwt.sign(
      { 
        id: teamMember._id,
        email: teamMember.email,
        teamName: teamMember.teamName
      },
      process.env.JWT_SECRET!,
      { expiresIn: '365d' }
    );

    res.json({
      message: '이메일 인증이 완료되었습니다.',
      token: permanentToken,
      user: {
        id: teamMember._id,
        email: teamMember.email,
        teamName: teamMember.teamName
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(401).json({ message: '유효하지 않은 인증입니다.' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      teamName: string;
    };

    const teamMember = await TeamMember.findOne({
      _id: decoded.id,
      email: decoded.email,
      teamName: decoded.teamName,
      verified: true
    });

    if (!teamMember) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    res.json({
      user: {
        id: teamMember._id,
        email: teamMember.email,
        teamName: teamMember.teamName
      }
    });
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};