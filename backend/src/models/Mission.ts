// src/models/Mission.ts
import mongoose from 'mongoose';
import { IMission } from '../types/mission';

const missionSchema = new mongoose.Schema<IMission>({
  title: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  introduction: String,
  mainContent: {
    type: String,
    required: true
  },
  examples: [String],
  conclusion: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: Date
}, {
  timestamps: true
});

export default mongoose.model<IMission>('Mission', missionSchema);