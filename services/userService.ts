import { getDb } from "@/lib/mongodb";
import type { User } from "@/models/User";

const USERS_COLLECTION = "users";

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.collection<User>(USERS_COLLECTION).findOne({ username });
  return user;
}
