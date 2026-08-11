import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AgentEnv } from '../types';
import { getDb, getSettings, listQuestions, setTutorialMode } from '../db/queries';
import { modeSchema } from '../lib/validators';
import { attemptGuard } from '../middleware/attempt';
import { elapsedSeconds, gatePassed } from '../lib/flow';
import { shellFor } from '../lib/shell';
import { LearnPage } from '../pages/learn/LearnPage';
import { LESSONS } from '../lib/lesson-data';
import type { LessonWithState } from '../lib/lesson';

const app = new Hono<AgentEnv>();

app.use('*', attemptGuard);

// Support both /learn and /learn/:lessonId
app.get('/:lessonId?', async (c) => {
  const attempt = c.get('attempt');
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const db = getDb(c.env.DB);
  const settings = await getSettings(db);
  const remaining = attempt.tutorialStartedAt
    ? Math.max(0, settings.minTutorialSeconds - elapsedSeconds(attempt.tutorialStartedAt))
    : settings.minTutorialSeconds;

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect('/');

  const active = await listQuestions(db, { activeOnly: true });

  // Map static lessons into LessonWithState
  const requestedId = c.req.param('lessonId') || LESSONS[0].id;
  const currentIndex = LESSONS.findIndex((l) => l.id === requestedId);
  const activeIndex = currentIndex !== -1 ? currentIndex : 0;

  const lessonsWithState: LessonWithState[] = LESSONS.map((l, index) => ({
    id: l.id,
    title: l.title,
    order: l.order,
    content: l.content,
    durationMinutes: l.durationMinutes,
    elapsedSeconds: index === activeIndex ? settings.minTutorialSeconds - remaining : 0,
    state: index === activeIndex ? 'active' : index < activeIndex ? 'completed' : 'locked',
  })) as any;

  const currentLesson = lessonsWithState[activeIndex];

  return c.html(
    <LearnPage
      shell={shell}
      lesson={currentLesson}
      lessons={lessonsWithState}
      remainingSeconds={remaining}
      questionCount={active.length}
      criticalCount={active.filter((q) => q.isCritical).length}
      error={c.req.query('early') ? 'Take a little longer with the material first.' : undefined}
    />,
  );
});

app.post(
  '/mode',
  zValidator('form', modeSchema, (result, c) => {
    if (!result.success) return c.redirect('/learn');
  }),
  async (c) => {
    const attempt = c.get('attempt');
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    await setTutorialMode(getDb(c.env.DB), attempt.id, c.req.valid('form').mode);
    return c.redirect('/learn');
  },
);

// Advance to next lesson or go to quiz if on the last lesson
app.post('/:lessonId/continue', async (c) => {
  const lessonId = c.req.param('lessonId');
  const attempt = c.get('attempt');
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const db = getDb(c.env.DB);
  const currentIndex = LESSONS.findIndex((l) => l.id === lessonId);

  if (currentIndex === -1) {
    return c.redirect(`/learn/${LESSONS[0].id}`);
  }

  // If there is a next lesson, go to it
  if (currentIndex < LESSONS.length - 1) {
    const nextLesson = LESSONS[currentIndex + 1];
    return c.redirect(`/learn/${nextLesson.id}`);
  }

  // ==========================================
  // FINAL LESSON: Mark the tutorial as complete 
  // in your database so /quiz lets you through!
  // ==========================================
  // Example (uncomment or match your DB query function):
  // await db.update(attempts).set({ tutorialCompletedAt: new Date() }).where(eq(attempts.id, attempt.id));

  return c.redirect('/quiz');
});

export default app;