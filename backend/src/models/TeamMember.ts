// src/models/TeamMember.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface ITeamMember {
  teamName: string;
  username: string;
  password: string;
  email: string;
  verified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  chatHistory?: mongoose.Types.ObjectId[];
  completedMissions?: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface TeamMemberModel extends mongoose.Model<ITeamMember> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const teamMemberSchema = new mongoose.Schema<ITeamMember, TeamMemberModel>({
  teamName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
  },
  chatHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }],
  completedMissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }]
});

// Hash password before saving
teamMemberSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
teamMemberSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compound index for unique email per team
teamMemberSchema.index({ teamName: 1, email: 1 }, { unique: true });

export const TeamMember = mongoose.model<ITeamMember, TeamMemberModel>('TeamMember', teamMemberSchema);
