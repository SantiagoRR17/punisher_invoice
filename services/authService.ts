import bcrypt from "bcrypt";
import { findUserByUsername } from "@/services/userService";
import type { AuthenticatedUser } from "@/models/User";

export async function verifyCredentials(
  username: string,
  password: string
): Promise<AuthenticatedUser | null> {
  if (!username || !password) {
    return null;
  }

  const user = await findUserByUsername(username);
  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return {
    id: String(user._id),
    username: user.username,
    role: user.role,
  };
}
