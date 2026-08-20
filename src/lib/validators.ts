import { z } from 'zod';
import { normalizePhone } from './phone';
import { IMPORT_TIER } from './questionFormat';

const trimmed = z.string().trim();

/**
 * Sign-in, not self-registration: Sales Agent ID + phone + email must match a
 * roster row an admin imported from the main app — see docs/flow.md §1.
 */
export const startSchema = z.object({
  agentId: trimmed
    .min(1, 'Enter your Sales Agent ID.')
    .max(40, 'That Sales Agent ID is too long.')
    .transform((value) => value.toUpperCase()),
  phone: trimmed
    .min(1, 'Enter your phone number.')
    .transform((value) => normalizePhone(value))
    .refine((value): value is string => value !== null, {
      message: 'That does not look like a Nigerian number. Try 08012345678.',
    }),
  email: trimmed
    .min(1, 'Enter your email address.')
    .email('That email address is not valid.')
    .transform((value) => value.toLowerCase()),
});

export const modeSchema = z.object({
  mode: z.enum(['slides', 'video'], { message: 'Pick slides or video.' }),
});

export const answerSchema = z.object({
  questionId: trimmed.min(1),
  selectedIndex: z.coerce.number().int().min(0).max(5),
});

export const attestSchema = z.object({
  confirm: z.literal('on', { message: 'Tick the box to confirm you have read the rules.' }),
});

/**
 * A sales agent editing their own details.
 *
 * Neither the phone number nor the tier is here. The phone is the identity
 * column every attempt hangs off; the tier is what the training *certifies*, so
 * self-service promotion would make the certificate meaningless. Both are
 * absent from the form and absent from this schema, which is what stops a
 * hand-rolled POST from setting them.
 */
export const profileSchema = z.object({
  name: trimmed.min(2, 'Enter your full name.').max(80, 'Name is too long.'),
  email: z
    .union([z.literal(''), trimmed.email('That email address is not valid.')])
    .optional()
    .transform((value) => (value ? value : null)),
});

/* --------------------------------------------------------------- admin auth */

const email = trimmed.email('Enter a valid email address.').transform((v) => v.toLowerCase());

/** Length is the only rule worth enforcing; a composition rule buys nothing. */
const password = z.string().min(10, 'Use at least 10 characters.').max(200, 'That is too long.');

export const adminLoginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

/** First run only — guarded by the setup key and by there being no admins yet. */
export const adminSetupSchema = z
  .object({
    name: trimmed.min(2, 'Enter your name.').max(80, 'Name is too long.'),
    email,
    password,
    confirm: z.string(),
    setupKey: z.string().min(1, 'Enter the setup key.'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Those two passwords do not match.',
    path: ['confirm'],
  });

/** Adding a colleague from Settings → Team. */
export const adminInviteSchema = z.object({
  name: trimmed.min(2, 'Enter their name.').max(80, 'Name is too long.'),
  email,
  password,
});

const optionFields = z.object({
  option_0: trimmed.optional(),
  option_1: trimmed.optional(),
  option_2: trimmed.optional(),
  option_3: trimmed.optional(),
  option_4: trimmed.optional(),
  option_5: trimmed.optional(),
});

export const questionSchema = z
  .object({
    prompt: trimmed.min(5, 'Write the question.').max(500, 'Question is too long.'),
    correctIndex: z.coerce.number().int().min(0).max(5),
    orderIndex: z.coerce.number().int().min(0).max(999).default(0),
    isCritical: z.union([z.literal('on'), z.undefined()]).transform((v) => v === 'on'),
    isActive: z.union([z.literal('on'), z.undefined()]).transform((v) => v === 'on'),
  })
  .merge(optionFields)
  .transform((raw) => ({
    prompt: raw.prompt,
    correctIndex: raw.correctIndex,
    orderIndex: raw.orderIndex,
    isCritical: raw.isCritical,
    isActive: raw.isActive,
    options: [raw.option_0, raw.option_1, raw.option_2, raw.option_3, raw.option_4, raw.option_5]
      .map((o) => (o ?? '').trim())
      .filter((o) => o.length > 0),
  }))
  .refine((v) => v.options.length >= 2, {
    message: 'Give at least two options.',
    path: ['option_1'],
  })
  .refine((v) => v.correctIndex < v.options.length, {
    message: 'The correct option must be one you filled in.',
    path: ['correctIndex'],
  });

/* ------------------------------------------------------- question import */

/**
 * The uploaded file, validated shape-first.
 *
 * `answer` is the option's *text*, not its index: a model that has just written
 * four options can copy the right one back reliably, whereas asking it for a
 * zero-based index is how you get a quiz where every answer is off by one and
 * nobody notices until an agent fails.
 */
const importedQuestion = z
  .object({
    question: trimmed.min(5, 'Question is too short.').max(500, 'Question is too long.'),
    options: z
      .array(trimmed.min(1, 'An option is blank.').max(200, 'An option is too long.'))
      .min(2, 'Give at least two options.')
      .max(6, 'Six options at most.'),
    answer: trimmed.min(1, 'Give the correct answer.'),
    critical: z.boolean().optional().default(false),
  })
  .refine(
    (q) => q.options.some((o) => o.toLowerCase() === q.answer.toLowerCase()),
    { message: 'The answer must be one of the options, copied exactly.', path: ['answer'] },
  );

export const questionImportSchema = z.object({
  // A refine rather than z.literal: literal ignores `message` in zod 3 and
  // reports "Invalid literal value, expected \"SP3\"", which tells an admin
  // nothing about why. Case and stray spaces are forgiven — "sp3 " is not a
  // different course.
  tier: trimmed.refine((value) => value.toUpperCase() === IMPORT_TIER, {
    message: `Only ${IMPORT_TIER} questions can be imported — it is the only course that exists.`,
  }),
  questions: z
    .array(importedQuestion)
    .min(1, 'The file has no questions in it.')
    .max(100, 'A hundred questions at most in one file.'),
});

export type ImportedQuestion = z.infer<typeof importedQuestion>;

/**
 * Zod's issue paths are `questions.3.answer`; an admin needs "Question 4".
 * Reported one per line rather than as a single blob, because a thirty-question
 * file usually has the same mistake three times.
 */
export function importErrors(error: z.ZodError): string[] {
  return error.issues.slice(0, 8).map((issue) => {
    const [head, index, field] = issue.path;
    if (head === 'questions' && typeof index === 'number') {
      return `Question ${index + 1}${field ? ` (${String(field)})` : ''}: ${issue.message}`;
    }
    return issue.message;
  });
}

export const settingsSchema = z.object({
  passMark: z.coerce.number().int().min(1).max(100),
  minTutorialSeconds: z.coerce.number().int().min(0).max(3600),
  // Normalized in the handler, alongside the Drive links, so both kinds of
  // "paste something and we tidy it" live in one place.
  supportPhone: trimmed.optional().default(''),
  supportEmail: z
    .union([z.literal(''), trimmed.email('That email address is not valid.')])
    .optional()
    .default(''),
});

/* --------------------------------------------------------- sales agent roster */

/**
 * One sales agent — a row of the imported roster, or a single agent added by
 * hand. `agentId` is uppercased to match `startSchema`, so an admin typing
 * "sag392585" and an agent typing "SAG392585" resolve to the same row.
 */
export const agentSchema = z.object({
  agentId: trimmed
    .min(1, 'Enter their Sales Agent ID.')
    .max(40, 'Sales Agent ID is too long.')
    .transform((value) => value.toUpperCase()),
  name: trimmed.min(2, 'Enter their name.').max(80, 'Name is too long.'),
  email: trimmed
    .min(1, 'Enter their email address.')
    .email('That email address is not valid.')
    .transform((value) => value.toLowerCase()),
  phone: trimmed
    .min(1, 'Enter their phone number.')
    .transform((value) => normalizePhone(value))
    .refine((value): value is string => value !== null, {
      message: 'That does not look like a Nigerian number. Try 08012345678.',
    }),
});

export const agentImportSchema = z.object({
  agents: z
    .array(agentSchema)
    .min(1, 'The pasted text has no agent rows in it.')
    .max(2000, 'Two thousand rows at most in one import.'),
});

export type AgentInput = z.infer<typeof agentSchema>;

/** Row numbers count the header row, so an admin can find the line in the sheet. */
export function agentImportErrors(error: z.ZodError): string[] {
  return error.issues.slice(0, 8).map((issue) => {
    const [head, index, field] = issue.path;
    if (head === 'agents' && typeof index === 'number') {
      return `Row ${index + 2}${field ? ` (${String(field)})` : ''}: ${issue.message}`;
    }
    return issue.message;
  });
}

export type StartInput = z.infer<typeof startSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;

/**
 * Re-populate the question form after a validation failure. Losing a typed-out
 * question because one option was blank is the kind of thing that ends a demo.
 */
export function rawQuestionValues(raw: Record<string, string> | undefined) {
  const r = raw ?? {};
  return {
    prompt: r.prompt ?? '',
    options: [r.option_0, r.option_1, r.option_2, r.option_3, r.option_4, r.option_5].map(
      (o) => o ?? '',
    ),
    correctIndex: Number(r.correctIndex ?? 0),
    orderIndex: Number(r.orderIndex ?? 0),
    isCritical: r.isCritical === 'on',
    isActive: r.isActive === 'on',
  };
}

/** First message per field, for inline rendering next to the input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
