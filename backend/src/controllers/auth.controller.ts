// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { sendAuthEmail } from "../utils/emailService";
import { IUser } from "../types/user";

interface RegisterRequest extends Request {
  body: {
    username: string;
    password: string;
    email?: string;
    teamName?: string;
    isAdmin?: boolean;
  };
}

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
    teamName?: string;
  };
}

export const register = async (req: RegisterRequest, res: Response) => {
  try {
    const { username, password, email, teamName, isAdmin } = req.body;

    // 팀 멤버 등록시 teamName 필수 체크
    if (!isAdmin && !teamName) {
      return res
        .status(400)
        .json({ message: "팀 멤버는 팀 이름이 필수입니다." });
    }

    // 이미 존재하는 사용자 확인
    const existingUser = await User.findOne({
      ...(teamName ? { teamName, username } : { username }),
    });

    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    // 새 사용자 생성
    const user = new User({
      username,
      password,
      ...(email && { email }),
      ...(teamName && { teamName }),
      isAdmin: isAdmin || false,
    });

    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id,
        teamName: user.teamName,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "계정이 생성되었습니다.",
      token,
      user: {
        id: user._id,
        username,
        teamName: user.teamName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const login = async (req: LoginRequest, res: Response) => {
  try {
    const { username, password, teamName } = req.body;

    // 사용자 찾기
    const user = await User.findOne({
      ...(teamName ? { teamName, username } : { username }),
    });

    if (!user) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id,
        teamName: user.teamName,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        teamName: user.teamName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const initiateAuth = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { teamName } = req.params;

    // 이메일 발송
    const token = await sendAuthEmail(email, teamName);

    // 임시 사용자 생성 또는 업데이트
    await User.findOneAndUpdate(
      { email, teamName },
      { email, teamName, lastLoginAttempt: new Date() },
      { upsert: true }
    );

    res.json({
      message: "인증 이메일이 발송되었습니다.",
      email,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
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
      { expiresIn: "365d" } // 1년
    );

    res.json({
      message: "인증이 완료되었습니다.",
      token: permanentToken,
      user: { email, teamName },
    });
  } catch (error) {
    res.status(401).json({ message: "유효하지 않은 인증입니다." });
  }
};
