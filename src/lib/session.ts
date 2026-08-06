import type { Context, Env } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import type { Bindings } from '../types';

const ATTEMPT_COOKIE = 'attempt_id';
const ADMIN_COOKIE = 'admin_session';
const ATTEMPT_TTL = 60 * 60 * 8; // 8 h
const ADMIN_TTL = 60 * 60 * 12; // 12 h

const base: CookieOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'Lax',
};

/**
 * Secure in production, where it matters. A Secure cookie is silently dropped
 * over plain HTTP, and `wrangler dev` on a LAN address (http://192.168.x.x:8787)
 * is exactly how you test on a real Android phone — with Secure forced on, the
 * cookie never sticks and every screen bounces back to the start.
 */
const optionsFor = <E extends Env>(c: Context<E>, maxAge: number): CookieOptions => ({
  ...base,
  maxAge,
  secure: new URL(c.req.url).protocol === 'https:',
});

/** Generic over Env so these work from both the plain and attempt-guarded routers. */
const secretOf = <E extends Env>(c: Context<E>) => (c.env as Bindings).SESSION_SECRET;

export async function setAttemptCookie<E extends Env>(c: Context<E>, attemptId: string) {
  await setSignedCookie(c, ATTEMPT_COOKIE, attemptId, secretOf(c), optionsFor(c, ATTEMPT_TTL));
}

export async function getAttemptId<E extends Env>(c: Context<E>): Promise<string | null> {
  const value = await getSignedCookie(c, secretOf(c), ATTEMPT_COOKIE);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function clearAttemptCookie<E extends Env>(c: Context<E>): void {
  deleteCookie(c, ATTEMPT_COOKIE, { path: '/' });
}

/**
 * The cookie carries *which* admin signed in, not a yes/no — every screen that
 * needs a name (and every future audit line) reads it from here rather than
 * assuming a single shared operator.
 */
export async function setAdminCookie<E extends Env>(c: Context<E>, adminId: string) {
  await setSignedCookie(c, ADMIN_COOKIE, adminId, secretOf(c), optionsFor(c, ADMIN_TTL));
}

export async function getAdminId<E extends Env>(c: Context<E>): Promise<string | null> {
  // Unsigned would mean anyone types admin_session=<any id> in devtools and walks in.
  const value = await getSignedCookie(c, secretOf(c), ADMIN_COOKIE);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function clearAdminCookie<E extends Env>(c: Context<E>): void {
  deleteCookie(c, ADMIN_COOKIE, { path: '/' });
}

/** Compare digests, not raw strings — `===` on secrets leaks length and prefix. */
export async function secretMatches(supplied: string, expected: string): Promise<boolean> {
  if (!expected) return false;
  const [a, b] = await Promise.all([sha256(supplied), sha256(expected)]);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return new Uint8Array(digest);
}
