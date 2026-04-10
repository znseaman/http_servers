import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteUsers() {
  const result = await db.delete(users);
  return result;
}

export async function getUser(email: string) {
  const [result] = await db.select().from(users).where(eq(users.email, email));
  return result;
}

export async function updateUser(user: {
  email: string;
  hashed_password: string;
  id: string;
}) {
  const [result] = await db
    .update(users)
    .set({ email: user.email, hashed_password: user.hashed_password })
    .where(eq(users.id, user.id))
    .returning();
  return result;
}
