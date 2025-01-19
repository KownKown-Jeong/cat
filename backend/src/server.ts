// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import missionRoutes from './routes/mission.routes';

dotenv.config();

const app = express();


// 미들웨어
// CORS 설정
app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 주소
  credentials: true
}));
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});