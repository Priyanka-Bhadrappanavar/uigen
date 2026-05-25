// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import { createSession, getSession } from "@/lib/auth";

const { mockCookieSet, mockCookieGet } = vi.hoisted(() => ({
  mockCookieSet: vi.fn(),
  mockCookieGet: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockCookieSet, get: mockCookieGet })),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("sets a cookie named 'auth-token'", async () => {
    await createSession("user-123", "test@example.com");
    expect(mockCookieSet).toHaveBeenCalledWith(
      "auth-token",
      expect.any(String),
      expect.any(Object)
    );
  });

  test("token is a valid JWT containing userId and email", async () => {
    await createSession("user-123", "test@example.com");
    const token = mockCookieSet.mock.calls[0][1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    expect(payload.userId).toBe("user-123");
    expect(payload.email).toBe("test@example.com");
  });

  test("cookie is httpOnly with sameSite lax and path /", async () => {
    await createSession("user-123", "test@example.com");
    const options = mockCookieSet.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  test("cookie expires approximately 7 days from now", async () => {
    const before = Date.now();
    await createSession("user-123", "test@example.com");
    const after = Date.now();

    const options = mockCookieSet.mock.calls[0][2];
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });

  test("cookie secure is false outside production", async () => {
    await createSession("user-123", "test@example.com");
    const options = mockCookieSet.mock.calls[0][2];
    expect(options.secure).toBe(false);
  });

  test("cookie secure is true in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await createSession("user-123", "test@example.com");
    const options = mockCookieSet.mock.calls[0][2];
    expect(options.secure).toBe(true);
    vi.unstubAllEnvs();
  });
});

describe("getSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function makeToken(payload: object, expiresIn = "7d") {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiresIn)
      .setIssuedAt()
      .sign(JWT_SECRET);
  }

  test("returns null when no cookie is present", async () => {
    mockCookieGet.mockReturnValue(undefined);
    expect(await getSession()).toBeNull();
  });

  test("returns the session payload for a valid token", async () => {
    const token = await makeToken({ userId: "user-123", email: "test@example.com" });
    mockCookieGet.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session?.userId).toBe("user-123");
    expect(session?.email).toBe("test@example.com");
  });

  test("returns null for a malformed token", async () => {
    mockCookieGet.mockReturnValue({ value: "not.a.valid.jwt" });
    expect(await getSession()).toBeNull();
  });

  test("returns null for an expired token", async () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 10;
    const token = await makeToken({ userId: "user-123", email: "test@example.com" }, pastTimestamp);
    mockCookieGet.mockReturnValue({ value: token });
    expect(await getSession()).toBeNull();
  });

  test("reads from the auth-token cookie", async () => {
    mockCookieGet.mockReturnValue(undefined);
    await getSession();
    expect(mockCookieGet).toHaveBeenCalledWith("auth-token");
  });
});
