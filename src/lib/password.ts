/**
 * Password hashing for admin accounts.
 *
 * Workers have no bcrypt/argon2 — there is no native module to load — so this
 * is PBKDF2-SHA256 over WebCrypto, which is available at the edge and is what
 * Cloudflare's own guidance points at. 100,000 iterations is the most the
 * Workers runtime's WebCrypto will do — it throws NotSupportedError above
 * that, unlike Node's crypto, which is why this can pass locally under
 * `wrangler dev` and still fail once deployed.
 *
 * The stored string carries its own parameters:
 *
 *     pbkdf2-sha256$100000$<salt base64>$<hash base64>
 *
 * so raising the iteration count later does not invalidate existing rows — an
 * old hash still verifies against the count it was written with.
 */
const ALGO = 'pbkdf2-sha256';
const ITERATIONS = 100_000;
const KEY_BITS = 256;
const SALT_BYTES = 16;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${ALGO}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/**
 * Constant-time compare — `===` on a digest leaks how much of it matched, and
 * a login form is exactly where that gets measured.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, iterations, salt, hash] = stored.split('$');
  if (algo !== ALGO || !iterations || !salt || !hash) return false;

  const expected = fromBase64(hash);
  const actual = await derive(password, fromBase64(salt), Number(iterations));
  if (expected.length !== actual.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i]! ^ actual[i]!;
  return diff === 0;
}
