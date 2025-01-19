// src/types/user.ts
export interface IUser {
    username: string;
    password: string;
    isAdmin: boolean;
    team?: string;
  }