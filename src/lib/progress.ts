import type { Attempt, Settings } from "../db/schema";
import { nextUnansweredQuestion, type Db } from "../db/queries";
import { elapsedSeconds } from "./flow";

export type StepKey = "start" | "training" | "quiz" | "attest" | "results";

export type StepState = "done" | "current" | "todo";

export type Step = { key: StepKey; label: string; state: StepState };

const LABELS: { key: StepKey; label: string }[] = [
  { key: "start", label: "Get Started" },
  { key: "training", label: "Training" },
  { key: "quiz", label: "Quiz" },
  { key: "attest", label: "Attestation" },
  { key: "results", label: "Results" },
];

export type Progress = {
  steps: Step[];
  /** 0–100, counting the step in hand as reached. */
  percent: number;
  current: StepKey;
  answered: number;
  totalQuestions: number;
  /** Seconds spent on the tutorial, capped at the requirement. */
  tutorialSeconds: number;
  minTutorialSeconds: number;
  gatePassed: boolean;
};

export async function attemptProgress(
  db: Db,
  attempt: Attempt,
  settings: Settings,
): Promise<Progress> {
  const { answered, total } = await nextUnansweredQuestion(db, attempt.id);

  const tutorialSeconds = elapsedSeconds(attempt.tutorialStartedAt);
  const gatePassed =
    attempt.tutorialMode !== null &&
    tutorialSeconds >= settings.minTutorialSeconds;

  // An attempt only exists because someone filled in the start form, so the
  // first step is done by the time this screen can be reached at all.
  const done: Record<StepKey, boolean> = {
    start: true,
    training: gatePassed,
    quiz: total > 0 && answered >= total,
    attest: attempt.attestedAt !== null,
    results: attempt.submittedAt !== null,
  };

  const firstTodo = LABELS.findIndex((s) => !done[s.key]);
  const allDone = firstTodo === -1;
  const currentAt = allDone ? LABELS.length - 1 : firstTodo;

  const steps: Step[] = LABELS.map((s, i) => ({
    key: s.key,
    label: s.label,
    state: done[s.key] ? "done" : i === currentAt ? "current" : "todo",
  }));

  // "start" is excluded here on purpose: it's satisfied just by having logged
  // in, so counting it toward the percent would put a brand-new attempt at
  // 40% (2 of 5 steps) before any real work is done. The goal gauge should
  // read 0% at login and 100% only once results are in.
  const PROGRESS_KEYS: StepKey[] = ["training", "quiz", "attest", "results"];
  const doneCount = PROGRESS_KEYS.filter((key) => done[key]).length;

  return {
    steps,
    percent: (doneCount / PROGRESS_KEYS.length) * 100,
    current: LABELS[currentAt]!.key,
    answered,
    totalQuestions: total,
    tutorialSeconds: Math.min(tutorialSeconds, settings.minTutorialSeconds),
    minTutorialSeconds: settings.minTutorialSeconds,
    gatePassed,
  };
}

/* ----------------------------------------------------------------- modules */

export type ModuleState =
  | "completed"
  | "in-progress"
  | "not-started"
  | "unavailable";

export type Module = {
  mode: "slides" | "video";
  title: string;
  /** The call to action on the card — "View Material" / "Watch Video". */
  action: string;
  blurb: string;
  state: ModuleState;
  /** 0–100. Real elapsed time against the gate, not a guess. */
  percent: number;
};

const MODULE_COPY = {
  slides: {
    title: "Training Materials",
    action: "View Material",
    blurb: "Review the essential reading materials.",
  },
  video: {
    title: "Training Video",
    action: "Watch Video",
    blurb: "Watch the training videos to learn.",
  },
} as const;

export function modulesFor(
  attempt: Attempt,
  settings: Settings,
  progress: Progress,
): Module[] {
  const urls = {
    slides: settings.slidesUrl,
    video: settings.videoUrl ?? settings.videoKey,
  };

  return (["slides", "video"] as const).map((mode) => {
    const chosen = attempt.tutorialMode === mode;
    const ownPercent = chosen
      ? Math.min(
          100,
          (progress.tutorialSeconds /
            Math.max(1, progress.minTutorialSeconds)) *
            100,
        )
      : 0;

    let state: ModuleState;
    if (!urls[mode]) state = "unavailable";
    else if (progress.gatePassed) state = "completed";
    else if (chosen) state = "in-progress";
    else state = "not-started";

    const percent = state === "completed" ? 100 : ownPercent;

    return { mode, ...MODULE_COPY[mode], state, percent };
  });
}

/* ------------------------------------------------------------- resume card */

export type Resume = { title: string; blurb: string; cta: string };

const RESUME: Record<StepKey, Resume> = {
  start: {
    title: "Training",
    blurb: "Pick a format and work through the material to unlock the quiz.",
    cta: "Start Training",
  },
  training: {
    title: "Training",
    blurb: "Work through the material, then continue to the quiz.",
    cta: "Continue Training",
  },
  quiz: {
    title: "Quiz",
    blurb: "Answer all questions to test your knowledge and understanding.",
    cta: "Continue Quiz",
  },
  attest: {
    title: "Attestation",
    blurb: "Confirm you have read the conduct rules to submit your answers.",
    cta: "Continue to Attestation",
  },
  results: {
    title: "Results",
    blurb: "Your training is complete. See your score and review every answer.",
    cta: "View Results",
  },
};

export const resumeFor = (step: StepKey): Resume => RESUME[step];
