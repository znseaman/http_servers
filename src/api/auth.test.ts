import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
  assert,
} from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from "./auth";
import { JsonWebTokenError } from "jsonwebtoken";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  let hash1: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the incorrect password", async () => {
    const result = await checkPasswordHash("wrong password", hash1);
    expect(result).toBe(false);
  });
});

describe("JWTs", () => {
  let user_jwt_1: string;
  const user1 = {
    userID: "1",
    expiresIn: Date.now(),
    secret: "1",
  };

  beforeAll(async () => {
    user_jwt_1 =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJzdWIiOiIxIiwiaWF0IjoxNzc1Njc4Mzg4LCJleHAiOjE3Nzc0NTQwNjY2MTR9.45vIS43O5BihnZ373eymZeMSRDJ5dCPczkCqzDrxSts";
  });

  it("should return valid jwt", async () => {
    const now = 1775678388226;
    user1.expiresIn = now;

    const result = makeJWT(user1.userID, user1.expiresIn, user1.secret, now);
    expect(result).toBe(user_jwt_1);
  });

  it("should successfully validate jwt", async () => {
    const result = validateJWT(user_jwt_1, user1.secret);
    expect(result).toBe(user1.userID);
  });

  it("should successfully reject jwt", async () => {
    assert.throws(
      () => validateJWT(user_jwt_1, "2"),
      JsonWebTokenError,
      "invalid signature",
    );

    assert.throws(
      () =>
        validateJWT(
          "dflskdajflsdakjfsad;lkfjds.dsfklsdajflsdakfjdslkj.dfjsdakfldasjflkj.dflksadjflkj",
          user1.secret,
        ),
      JsonWebTokenError,
      "jwt malformed",
    );
  });
});
