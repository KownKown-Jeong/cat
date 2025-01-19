// src/models/User.ts
import mongoose from "mongoose";
import { IUser } from "../types/user";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false, // admin은 이메일이 필요없을 수 있음
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    teamName: {
      type: String,
      required: function () {
        return !this.isAdmin;
      }, // admin이 아닐 경우에만 필수
    },
    verified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    chatHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    completedMissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 비밀번호 해싱
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 팀별 고유 이메일 인덱스
userSchema.index(
  { teamName: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      teamName: { $exists: true },
      email: { $exists: true },
    },
  }
);

export default mongoose.model<IUser>("User", userSchema);
