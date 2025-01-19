// src/models/User.ts
import mongoose from 'mongoose';
import { IUser } from '../types/user';

const userSchema = new mongoose.Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  team: { 
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);