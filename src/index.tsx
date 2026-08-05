import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from './types';
import auth from './routes/auth';
import dashboard from './routes/dashboard';
import learn from './routes/learn';
import quiz from './routes/quiz';
import admin from './routes/admin';
import { Layout } from './components/common/Layout';
import { Alert } from './components/common/Alert';

const app = new Hono<AppEnv>();

app.use('*', secureHeaders());

/**
 * Every mutation here is a cookie-authenticated form POST — exactly the shape
 * CSRF exploits. Next.js Server Actions handled this for you; Hono does not.
 */
app.use('*', (c, next) =>
  csrf({
    origin: (origin) => origin === (c.env.ALLOWED_ORIGIN ?? new URL(c.req.url).origin),
  })(c, next),
);

// Never log phone numbers — they are never in a path, and nothing else is logged.
app.use('*', logger());

// Entry, training and quiz are separate routers: only the last two need an
// attempt to already exist, and only they carry the progress rail.
app.route('/', auth);
app.route('/dashboard', dashboard);
app.route('/learn', learn);
app.route('/', quiz);
app.route('/admin', admin);

app.notFound((c) =>
  c.html(
    <Layout title="Not found">
      <h1>Not found</h1>
      <Alert tone="info">That page does not exist, or it is not yours to see.</Alert>
      <a class="btn btn-ghost" href="/">
        Start again
      </a>
    </Layout>,
    404,
  ),
);

app.onError((err, c) => {
  // csrf() and friends throw HTTPException — keep their status rather than
  // reporting someone else's 403 as our 500.
  if (err instanceof HTTPException) return err.getResponse();

  console.error(err);
  return c.html(
    <Layout title="Something went wrong">
      <h1>Something went wrong</h1>
      <Alert tone="error">
        Try again. If you were part-way through the quiz, your answers are saved.
      </Alert>
      <a class="btn btn-ghost" href="/">
        Continue
      </a>
    </Layout>,
    500,
  );
});

export default app;
