import { FiAward } from "react-icons/fi";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { StatusPill } from "../common/StatusPill";
import { AnswerReview } from "../common/AnswerReview";
import type { Answer, Attempt } from "../../db/schema";
import { formatDate } from "../../lib/format";

export function AttemptHistory(props: {
  attempts: Attempt[];
  answersByAttempt: Map<string, Answer[]>;
}) {
  return (
    <div class="grid gap-4">
      {props.attempts.map((attempt, i) => {
        const answers = props.answersByAttempt.get(attempt.id) ?? [];
        const number = props.attempts.length - i;

        return (
          <Card
            title={`Attempt ${number}`}
            sub={[
              `Started ${formatDate(attempt.startedAt)}`,
              `format ${attempt.tutorialMode ?? "—"}`,
              attempt.submittedAt
                ? `scored ${attempt.score}/${attempt.total}`
                : "not submitted",
              attempt.attestedAt
                ? `rules confirmed ${formatDate(attempt.attestedAt)}`
                : "not attested",
            ].join(" · ")}
            aside={
              attempt.submittedAt ? (
                <span class="flex items-center gap-2">
                  <StatusPill tone={attempt.passed ? "pass" : "miss"}>
                    {attempt.passed ? "Pass" : "Fail"}
                  </StatusPill>
                  {attempt.passed ? (
                    <Button
                      href={`/admin/certificate/${attempt.id}`}
                      tone="quiet"
                      small
                    >
                      <FiAward size={16} />
                      Certificate
                    </Button>
                  ) : null}
                </span>
              ) : (
                <StatusPill>In progress</StatusPill>
              )
            }
          >
            {answers.length > 0 ? (
              <AnswerReview answers={answers} compact />
            ) : (
              <p class="m-0 text-[15px] text-muted">
                No answers recorded on this attempt.
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default AttemptHistory;
