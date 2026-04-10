import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { and, asc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function getChirps() {
  return await db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function getChirp(id: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
  return result;
}

export async function deleteChirp(chirp: { id: string; userId: string }) {
  const results: { deletedId: string | null }[] = await db
    .delete(chirps)
    .where(and(eq(chirps.id, chirp.id), eq(chirps.userId, chirp.userId)))
    .returning({ deletedId: chirps.id });
  return results;
}
