import { Request, Response } from "express";
import User from "../models/User";

// 모든 사용자 조회
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 }); // 비밀번호 제외
    res.json(users);
  } catch (error) {
    console.error("사용자 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 특정 사용자 조회
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (error) {
    console.error("사용자 조회 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 정보 수정
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { username, email, teamName } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        email,
        teamName,
        updatedAt: new Date(),
      },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("사용자 수정 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 삭제
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json({ message: "사용자가 삭제되었습니다." });
  } catch (error) {
    console.error("사용자 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 사용자 역할 수정
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { isAdmin } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        isAdmin,
        updatedAt: new Date(),
      },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("역할 수정 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
