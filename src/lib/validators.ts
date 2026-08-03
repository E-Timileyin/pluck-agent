import { z } from 'zod';
import { normalizePhone } from './phone';

const trimmed = z.string().trim();

/** Phone is the identifier, not email — see flow.md §1. */
export const startSchema = z.object({
  name: trimmed.min(2, 'Enter your full name.').max(80, 'Name is too long.'),
  phone: trimmed
    .min(1, 'Enter your phone number.')
    .transform((value) => normalizePhone(value))
    .refine((value): value is string => value !== null, {
      message: 'That does not look like a Nigerian number. Try 08012345678.',
    }),
  tier: z.enum(['SP1', 'SP2', 'SP3']).default('SP3'),
  email: z
    .union([z.literal(''), trimmed.email('That email address is not valid.')])
    .optional()
    .transform((value) => (value ? value : null)),
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

export const loginSchema = z.object({
  passcode: z.string().min(1, 'Enter the passcode.'),
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

export const settingsSchema = z.object({
  videoUrl: trimmed.optional().default(''),
  slidesUrl: trimmed.optional().default(''),
  passMark: z.coerce.number().int().min(1).max(100),
  minTutorialSeconds: z.coerce.number().int().min(0).max(3600),
});

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
