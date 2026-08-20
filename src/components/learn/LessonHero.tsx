import type { Lesson } from "../../lib/lesson";

// The title block that replaces the plain header on mobile — same lesson
// info, arranged the way the reference card reads (big lesson title first,
// the "Sales Agent Training" line demoted under it). Desktop's plain header
// carries the same facts in the opposite emphasis, so only one of the two
// ever renders (see LearnPage's `hidden lg:block` counterpart).
export function LessonHeroTitle(props: { lesson: Lesson; lessonNumber: number; totalLessons: number }) {
  return (
    <div class="mb-4 lg:hidden">
      <h1 class="m-0 text-[26px] leading-tight font-bold tracking-tight text-ink">
        {props.lesson.title}
      </h1>
      <p class="m-0 mt-1.5 text-[15px] font-semibold text-brand">
        Lesson {props.lessonNumber} of {props.totalLessons} — Sales Agent Training
      </p>
    </div>
  );
}

export default LessonHeroTitle;
