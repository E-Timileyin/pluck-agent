import type { Attempt } from './db/schema';

export type Bindings = {
  DB: D1Database;
  /** Shared secret for /admin/login. Not authentication — see tech-stack.md. */
  ADMIN_PASSCODE: string;
  /** 32+ random chars. Signs both cookies. */
  SESSION_SECRET: string;
  /** Optional. Falls back to the request's own origin. */
  ALLOWED_ORIGIN?: string;
};

export type AppEnv = { Bindings: Bindings };

/** Agent routes behind the attempt-cookie guard get the loaded attempt. */
export type AgentEnv = AppEnv & { Variables: { attempt: Attempt } };
