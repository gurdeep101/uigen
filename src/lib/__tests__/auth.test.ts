// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

// Mock "server-only" so it doesn't throw in the test environment
vi.mock("server-only", () => ({}));

// Capture what gets set on the mock cookie store
const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ set: mockSet }),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  mockSet.mockClear();
});

test("createSession sets a cookie with the correct name", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  const [cookieName] = mockSet.mock.calls[0];
  expect(cookieName).toBe("auth-token");
});

test("createSession sets the cookie with correct security options", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession sets a cookie that expires in ~7 days", async () => {
  const before = Date.now();
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");
  const after = Date.now();

  const [, , options] = mockSet.mock.calls[0];
  const expiresMs = options.expires.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDaysMs);
  expect(expiresMs).toBeLessThanOrEqual(after + sevenDaysMs);
});

test("createSession stores a valid JWT containing userId and email", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-42", "hello@example.com");

  const [, token] = mockSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});

test("createSession JWT uses HS256 algorithm", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-1", "test@example.com");

  const [, token] = mockSet.mock.calls[0];
  // Decode header without verifying to inspect the algorithm
  const [headerB64] = token.split(".");
  const header = JSON.parse(atob(headerB64));

  expect(header.alg).toBe("HS256");
});
