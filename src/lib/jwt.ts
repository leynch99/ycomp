import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
const secret = encoder.encode(process.env.JWT_SECRET ?? "dev-secret");

/** Session lifetime in seconds (7 days). Shared between JWT exp and cookie maxAge. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 604 800

export type SessionToken = {
  userId: string;
  role: "ADMIN" | "USER";
  email: string;
};

export async function signSession(payload: SessionToken) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionToken;
}
