import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv } from '../types';
import { createAttempt, getAttempt, getDb, upsertPromoter } from '../db/queries';
import { fieldErrors, startSchema } from '../lib/validators';
import { clearAttemptCookie, getAttemptId, setAttemptCookie } from '../lib/session';
import { stepFor } from '../lib/flow';
import { StartPage } from '../pages/auth/StartPage';

/**
 * Identity only: who is taking this, and which attempt are they on. Kept apart
 * from the training routes — nothing here needs an attempt to already exist.
 */
const app = new Hono<AppEnv>();

app.get('/', async (c) => {
  const attemptId = await getAttemptId(c);
  if (attemptId) {
    const db = getDb(c.env.DB);
    const attempt = await getAttempt(db, attemptId);
    // A live cookie means skip this screen and resume where they left off.
    if (attempt) return c.redirect(await stepFor(db, attempt));
    clearAttemptCookie(c);
  }
  return c.html(<StartPage />);
});

app.post(
  '/start',
  zValidator('form', startSchema, (result, c) => {
    if (!result.success) {
      const raw = result.data as unknown as Record<string, string>;
      return c.html(
        <StartPage
          values={{ name: raw?.name, phone: raw?.phone, tier: raw?.tier, email: raw?.email }}
          errors={fieldErrors(result.error)}
        />,
        400,
      );
    }
  }),
  async (c) => {
    const { name, phone, tier, email } = c.req.valid('form');
    const db = getDb(c.env.DB);

    // Same phone twice = same promoter, new attempt. Not an error.
    const promoter = await upsertPromoter(db, { name, phone, tier, email });
    const attempt = await createAttempt(db, promoter.id);
    await setAttemptCookie(c, attempt.id);

    return c.redirect('/learn');
  },
);

app.post('/restart', (c) => {
  clearAttemptCookie(c);
  return c.redirect('/');
});

export default app;
