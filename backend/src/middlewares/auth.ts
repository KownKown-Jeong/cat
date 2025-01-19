// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  teamName?: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
  user?: {
    userId: string;
    teamName?: string;
    isAdmin: boolean;
  };
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authentication required");
    }

    const JWT_SECRET = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    req.user = {
      userId: decoded.userId,
      teamName: decoded.teamName,
      isAdmin: decoded.isAdmin,
    };

    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "인증이 필요합니다." });
  }
};

export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.isAdmin) {
      throw new Error("Admin access required");
    }
    next();
  } catch (error) {
    res.status(403).json({ error: "Admin access required" });
  }
};

export const authenticateTeamMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestedTeamName = req.params.teamName;

    if (!req.user || req.user.teamName !== requestedTeamName) {
      throw new Error("팀 접근 권한이 없습니다.");
    }

    next();
  } catch (error) {
    res.status(403).json({ error: "해당 팀에 접근 권한이 없습니다." });
  }
};
