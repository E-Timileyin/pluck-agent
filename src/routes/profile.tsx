import { Hono, type Context, type Env } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AgentEnv, Bindings } from '../types';
import {
  deletePromoterPhoto,
  getAttempt,
  getDb,
  getPromoterPhoto,
  listAttemptsForPromoter,
  setPromoterPhoto,
  updatePromoter,
} from '../db/queries';
import { attemptGuard } from '../middleware/attempt';
import { getAttemptId } from '../lib/session';
import { fieldErrors, profileSchema } from '../lib/validators';
import { checkPhoto } from '../lib/photo';
import { shellFor } from '../lib/shell';
import { ProfilePage } from '../pages/profile/ProfilePage';

/**
 * The sales agent's own record. Name and email are theirs to correct; the
 * phone number and the tier are not — one is identity, the other is what the
 * training certifies.
 */
const app = new Hono<AgentEnv>();

app.use('*', attemptGuard);

const dbOf = (c: { env: unknown }) => getDb((c.env as Bindings).DB);

/**
 * The whole page, rebuilt from the cookie rather than from `c.get('attempt')` —
 * the zValidator hook loses the Env generic and cannot see context variables.
 * The guard has already run, so the cookie is there.
 */
async function profilePage<E extends Env>(
  c: Context<E>,
  extra: Partial<Parameters<typeof ProfilePage>[0]> = {},
) {
  const db = dbOf(c);
  const attemptId = await getAttemptId(c);
  const attempt = attemptId ? await getAttempt(db, attemptId) : undefined;
  if (!attempt) return null;

  const shell = await shellFor(db, attempt);
  if (!shell) return null;

  return (
    <ProfilePage
      shell={shell}
      attempts={await listAttemptsForPromoter(db, shell.promoter.id)}
      {...extra}
    />
  );
}

app.get('/', async (c) => {
  const page = await profilePage(c, {
    saved: !!c.req.query('saved'),
    photoError: c.req.query('photo') ? decodeURIComponent(c.req.query('photo')!) : undefined,
  });
  return page ? c.html(page) : c.redirect('/');
});

/* -------------------------------------------------------------------- photo */

/**
 * The agent's own photo. Served from D1 rather than from a bucket, so the whole
 * app still needs exactly one storage binding — see the note on
 * `promoter_photos` in db/schema.ts.
 *
 * `private` because it is a person's face: it may be cached on their phone, but
 * never in a CDN or a shared proxy. The URL carries the upload timestamp, so a
 * long max-age is safe and a replacement is picked up immediately.
 */
app.get('/photo', async (c) => {
  const db = dbOf(c);
  const attemptId = await getAttemptId(c);
  const attempt = attemptId ? await getAttempt(db, attemptId) : undefined;
  if (!attempt) return c.notFound();

  const photo = await getPromoterPhoto(db, attempt.promoterId);
  if (!photo) return c.notFound();

  return c.body(photo.data, 200, {
    'Content-Type': photo.mime,
    'Cache-Control': 'private, max-age=604800',
  });
});

app.post('/photo', async (c) => {
  const attempt = c.get('attempt');
  const body = await c.req.parseBody();
  const file = body['photo'];

  const fail = (message: string) => c.redirect(`/profile?photo=${encodeURIComponent(message)}`);

  if (!(file instanceof File)) return fail('Choose a photo first.');

  // Nothing is resized or re-encoded at the edge, so this is the only defence
  // against a 6 MB camera shot — see lib/photo.ts.
  const check = checkPhoto(file);
  if (!check.ok) return fail(check.error);

  await setPromoterPhoto(dbOf(c), attempt.promoterId, {
    mime: check.mime,
    data: await file.arrayBuffer(),
  });

  return c.redirect('/profile?saved=1');
});

app.post('/photo/remove', async (c) => {
  await deletePromoterPhoto(dbOf(c), c.get('attempt').promoterId);
  return c.redirect('/profile?saved=1');
});

app.post(
  '/',
  zValidator('form', profileSchema, async (result, c) => {
    if (!result.success) {
      const raw = result.data as unknown as Record<string, string>;
      const page = await profilePage(c, {
        values: { name: raw?.name, email: raw?.email },
        errors: fieldErrors(result.error),
      });
      return page ? c.html(page, 400) : c.redirect('/');
    }
  }),
  async (c) => {
    const attempt = c.get('attempt');
    const db = dbOf(c);
    const shell = await shellFor(db, attempt);
    if (!shell) return c.redirect('/');

    const { name, email } = c.req.valid('form');
    await updatePromoter(db, shell.promoter.id, { name, email });

    return c.redirect('/profile?saved=1');
  },
);

export default app;
