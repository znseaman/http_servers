import { db } from "../index.js";
import { NewRefreshToken, refresh_tokens } from "../schema.js";
import { and, asc, eq, lt, isNull, sql } from "drizzle-orm";

export async function createRefreshToken(token: NewRefreshToken) {
  const [result] = await db.insert(refresh_tokens).values(token).returning();
  return result;
}

export async function getRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refresh_tokens)
    .where(
      and(
        eq(refresh_tokens.token, token),
        lt(sql`now()`, refresh_tokens.expiresAt),
        isNull(refresh_tokens.revokedAt),
      ),
    );
  return result;
}

export async function revokeRefreshToken(token: string) {
  const updatedRevokedAt: { revokedAt: Date | null }[] = await db
    .update(refresh_tokens)
    .set({ revokedAt: new Date() })
    .where(eq(refresh_tokens.token, token))
    .returning({ revokedAt: refresh_tokens.revokedAt });

  return updatedRevokedAt;
}
