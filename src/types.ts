import type { Admin, Attempt } from "./db/schema";

export type Bindings = {
  DB: D1Database;
  /** The uploaded training video, when an admin uses R2 instead of a Drive link. */
  TRAINING_MEDIA: R2Bucket;

  ADMIN_PASSCODE: string;
  /** 32+ random chars. Signs both cookies. */
  SESSION_SECRET: string;
  /** Optional. Falls back to the request's own origin. */
  ALLOWED_ORIGIN?: string;
};

export type AppEnv = { Bindings: Bindings };

/** Agent routes behind the attempt-cookie guard get the loaded attempt. */
export type AgentEnv = AppEnv & { Variables: { attempt: Attempt } };

/** Console routes behind the admin guard get the account that signed in. */
export type AdminEnv = AppEnv & { Variables: { admin: Admin } };
