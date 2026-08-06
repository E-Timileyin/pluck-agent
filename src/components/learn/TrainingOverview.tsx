/**
 * The "Overview" block under the player. Written from the settings in force, so
 * the pass mark and the number of questions a promoter reads here are the ones
 * the server will apply.
 */
export function TrainingOverview(props: {
  passMark: number;
  questionCount: number;
  criticalCount: number;
}) {
  return (
    <section class="mt-4" aria-labelledby="overview-heading">
      <h2 id="overview-heading" class="m-0 mb-2 text-base font-semibold text-ink">
        Overview
      </h2>

      <div class="grid gap-2.5 text-sm/[1.6] text-muted">
        <p class="m-0">
          This material covers what a Pluck sales agent is expected to know before selling: how
          commission is earned and when it is paid, what a credit check does and does not tell you,
          and the conduct rules that carry real consequences if they are broken.
        </p>
        <p class="m-0">
          Work through it in whichever format suits you. Slides use very little data and can be read
          in a noisy market; the video says the same things out loud. Switching between them does not
          restart the timer.
        </p>
        <p class="m-0">
          The quiz that follows is {props.questionCount}{' '}
          {props.questionCount === 1 ? 'question' : 'questions'} long. You need {props.passMark}% to
          pass, and every one of the {props.criticalCount} compliance{' '}
          {props.criticalCount === 1 ? 'question' : 'questions'} has to be right — those are the ones
          that protect a customer's money, so getting one wrong fails the attempt whatever the total.
        </p>
      </div>
    </section>
  );
}

export default TrainingOverview;
