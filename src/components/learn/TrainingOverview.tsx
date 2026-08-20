// Numbers come straight from live settings, so what's read here always matches server enforcement.
export function TrainingOverview(props: {
  passMark: number;
  questionCount: number;
  criticalCount: number;
}) {
  return (
    <section class="mt-4" aria-labelledby="overview-heading">
      <h2
        id="overview-heading"
        class="m-0 mb-2 text-lg font-medium text-ink lg:text-base"
      >
        Overview
      </h2>

      {/* Capped width — `wide` drops the column's max-width, and long lines get hard to read on big screens */}
      <div class="grid max-w-[90ch] gap-2.5 text-[15px]/[1.6] text-muted lg:text-sm/[1.6]">
        <p class="m-0">
          This material covers what a Pluck sales agent is expected to know
          before selling: how commission is earned and when it is paid, what a
          credit check does and does not tell you, and the conduct rules that
          carry real consequences if they are broken.
        </p>
        <p class="m-0">
          Work through it in whichever format suits you. Slides use very little
          data and can be read in a noisy market; the video says the same things
          out loud. Switching between them does not restart the timer.
        </p>
        <p class="m-0">
          The quiz that follows is {props.questionCount}{" "}
          {props.questionCount === 1 ? "question" : "questions"} long. You need{" "}
          {props.passMark}% to pass, and every one of the {props.criticalCount}{" "}
          compliance {props.criticalCount === 1 ? "question" : "questions"} has
          to be right those are the ones that protect a customer's money, so
          getting one wrong fails the attempt whatever the total.
        </p>
      </div>
    </section>
  );
}

export default TrainingOverview;
