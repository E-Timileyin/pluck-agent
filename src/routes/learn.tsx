import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AgentEnv } from "../types";
import {
  getDb,
  getSettings,
  listQuestions,
  setTutorialMode,
} from "../db/queries";
import { modeSchema } from "../lib/validators";
import { attemptGuard } from "../middleware/attempt";
import { elapsedSeconds } from "../lib/flow";
import { shellFor } from "../lib/shell";
import { LearnPage } from "../pages/learn/LearnPage";
import { LESSONS } from "../lib/lesson-data";
import type { LessonState, LessonWithState } from "../lib/lesson";
import { serveVideoRange } from "../lib/video";

const app = new Hono<AgentEnv>();

app.use("*", attemptGuard);

// Registered ahead of "/:lessonId?" so "video" is never swallowed as a lesson id.
app.get("/video", async (c) => {
  const settings = await getSettings(getDb(c.env.DB));
  if (!settings.videoKey) return c.notFound();
  return serveVideoRange(c, c.env.TRAINING_MEDIA, settings.videoKey);
});

app.get("/:lessonId?", async (c) => {
  const attempt = c.get("attempt");
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const db = getDb(c.env.DB);
  const settings = await getSettings(db);
  const remaining = attempt.tutorialStartedAt
    ? Math.max(
        0,
        settings.minTutorialSeconds - elapsedSeconds(attempt.tutorialStartedAt),
      )
    : settings.minTutorialSeconds;

  const shell = await shellFor(db, attempt);
  if (!shell) return c.redirect("/");

  const active = await listQuestions(db, { activeOnly: true });

  // There's only one settings-level video/slides pair today, so every stub lesson shares it
  // until each lesson gets its own url/duration in the database.
  const requestedId = c.req.param("lessonId") || LESSONS[0].id;
  const currentIndex = LESSONS.findIndex((l) => l.id === requestedId);
  const activeIndex = currentIndex !== -1 ? currentIndex : 0;
  const mode = attempt.tutorialMode ?? "slides";
  // An uploaded video wins over a pasted Drive link — see settings.videoKey.
  const hosted = mode === "video" && Boolean(settings.videoKey);
  const url =
    (mode === "video" ? (settings.videoKey ? "/learn/video" : settings.videoUrl) : settings.slidesUrl) ??
    "";

  const lessonsWithState: LessonWithState[] = LESSONS.map((l, index) => {
    const state: LessonState =
      index === activeIndex
        ? "current"
        : index < activeIndex
          ? "done"
          : "locked";
    const lessonElapsed =
      index === activeIndex ? settings.minTutorialSeconds - remaining : 0;

    return {
      id: l.id,
      title: l.title,
      order: l.order,
      type: mode,
      url,
      hosted,
      minSeconds: settings.minTutorialSeconds,
      state,
      elapsedSeconds: lessonElapsed,
      percent: Math.min(
        100,
        Math.round(
          (lessonElapsed / Math.max(1, settings.minTutorialSeconds)) * 100,
        ),
      ),
    };
  });

  const currentLesson = lessonsWithState[activeIndex];

  return c.html(
    <LearnPage
      shell={shell}
      lesson={currentLesson}
      lessons={lessonsWithState}
      remainingSeconds={remaining}
      questionCount={active.length}
      criticalCount={active.filter((q) => q.isCritical).length}
      error={
        c.req.query("early")
          ? "Take a little longer with the material first."
          : undefined
      }
    />,
  );
});

app.post(
  "/mode",
  zValidator("form", modeSchema, (result, c) => {
    if (!result.success) return c.redirect("/learn");
  }),
  async (c) => {
    const attempt = c.get("attempt");
    if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

    await setTutorialMode(
      getDb(c.env.DB),
      attempt.id,
      c.req.valid("form").mode,
    );
    return c.redirect("/learn");
  },
);

app.post("/:lessonId/continue", async (c) => {
  const lessonId = c.req.param("lessonId");
  const attempt = c.get("attempt");
  if (attempt.submittedAt) return c.redirect(`/results/${attempt.id}`);

  const currentIndex = LESSONS.findIndex((l) => l.id === lessonId);

  if (currentIndex === -1) {
    return c.redirect(`/learn/${LESSONS[0].id}`);
  }

  if (currentIndex < LESSONS.length - 1) {
    const nextLesson = LESSONS[currentIndex + 1];
    return c.redirect(`/learn/${nextLesson.id}`);
  }
  return c.redirect("/quiz");
});

export default app;
