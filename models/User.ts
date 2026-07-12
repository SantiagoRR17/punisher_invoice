export type UserRole = "dueno" | "contadora";

export interface User {
  _id?: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}
