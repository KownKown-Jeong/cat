// src/models/Chat.ts
import mongoose from 'mongoose';

// 개별 메시지 스키마
const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// 채팅 세션 스키마
const chatSessionSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    required: true,
  },
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    // nullable - 일반 채팅일 경우
  },
  messages: [messageSchema],
  summary: {
    type: String,
    // 채팅 요약 정보
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// 업데이트 시 updatedAt 자동 갱신
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
