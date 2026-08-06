import { FiAlertTriangle, FiUpload } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Field, TEXTAREA } from '../common/Field';
import { IMPORT_TIER, QUESTION_JSON_EXAMPLE, QUESTION_PROMPT } from '../../lib/questionFormat';

/**
 * Bulk authoring: paste the JSON an AI wrote, or upload the file it saved.
 *
 * Nothing is imported half-way — the whole file is validated first, and a
 * single bad question rejects the lot with the question number said out loud.
 * A partial import is worse than none, because you cannot tell what landed.
 */
export function QuestionImport(props: {
  /** Kept so a rejected paste is not lost. */
  json?: string;
  errors?: string[];
}) {
  return (
    <div class="grid gap-4">
      <Card
        title="Import questions"
        sub={`Paste the JSON, or upload the file. ${IMPORT_TIER} only — it is the only course that exists.`}
      >
        {props.errors && props.errors.length > 0 ? (
          <div class="mb-4 rounded-xl bg-[#ffe6e0] p-4" role="alert">
            <p class="m-0 mb-2 flex items-center gap-2 text-[15px] font-semibold text-miss">
              <FiAlertTriangle size={18} />
              Nothing was imported.
            </p>
            <ul class="m-0 grid list-none gap-1 p-0 text-sm text-ink">
              {props.errors.map((error) => (
                <li>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <form
          method="post"
          action="/admin/questions/import"
          enctype="multipart/form-data"
          class="grid gap-5"
        >
          <Field label="JSON" hint="Paste the whole object, starting with { and ending with }.">
            <textarea
              class={`${TEXTAREA} min-h-48 font-mono text-[13px]/[1.6]`}
              name="json"
              rows={10}
              spellcheck={false}
              placeholder={QUESTION_JSON_EXAMPLE}
            >
              {props.json ?? ''}
            </textarea>
          </Field>

          <Field label="…or upload the file" optional hint="A .json file. It wins if you do both.">
            <input
              class="w-full rounded-xl border border-line bg-white p-3 text-[15px] text-ink file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-mint file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-ink"
              type="file"
              name="file"
              accept="application/json,.json,text/plain"
            />
          </Field>

          <label class="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl bg-brand-tint p-3.5 text-[15px] text-ink">
            <input
              class="mt-0.5 size-6 shrink-0 accent-brand"
              type="checkbox"
              name="deactivateExisting"
            />
            <span>
              Deactivate the current questions first
              <span class="mt-0.5 block text-[13px] text-muted">
                The old questions stay in the database and every past result still reads correctly —
                they simply stop being asked. Nothing is ever deleted.
              </span>
            </span>
          </label>

          <div>
            <Button type="submit">
              <FiUpload size={18} />
              Import questions
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Prompt for your AI"
        sub="Copy this into Claude (or any assistant), paste the training material under it, and it returns a file this screen accepts."
      >
        {/* A read-only textarea rather than a copy button: public/app.js is the
            tutorial countdown and nothing else, and select-all works on a phone. */}
        <textarea
          class={`${TEXTAREA} min-h-64 bg-brand-tint font-mono text-[13px]/[1.6]`}
          rows={16}
          readonly
          spellcheck={false}
          aria-label="Prompt to paste into an AI assistant"
        >
          {QUESTION_PROMPT}
        </textarea>
      </Card>
    </div>
  );
}

export default QuestionImport;
