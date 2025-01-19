// src/types/mission.ts
import mongoose from "mongoose";

interface ICompletedBy {
  user: mongoose.Types.ObjectId;
  completedAt: Date;
  chatHistory: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
}

export interface IMission {
  title: string;
  isPublic: boolean;
  introduction?: string;
  mainContent: string;
  examples: string[];
  conclusion?: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId[];
  status: "pending" | "in-progress" | "completed";
  dueDate?: Date;
  completedBy: ICompletedBy[];
}
