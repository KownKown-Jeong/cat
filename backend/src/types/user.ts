// src/types/user.ts
import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  isAdmin: boolean;
  teamName?: string;
  verified: boolean;
  lastLogin?: Date;
  chatHistory: string[];
  completedMissions: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}
