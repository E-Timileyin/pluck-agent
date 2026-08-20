import { FiChevronDown } from "react-icons/fi";
import { Card } from "../common/Card";

export type Faq = { question: string; answer: string };

export function FaqList(props: { faqs: Faq[] }) {
  return (
    <Card
      title="Common questions"
      sub="The answers are read from this training’s own settings."
    >
      <div class="grid gap-2">
        {props.faqs.map((faq) => (
          <details class="group rounded-xl border border-line px-4 open:bg-brand-tint/60">
            <summary class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span
                class="shrink-0 text-muted transition-transform duration-150 group-open:rotate-180"
                aria-hidden="true"
              >
                <FiChevronDown size={18} />
              </span>
            </summary>
            <p class="m-0 pb-4 text-[15px]/[1.6] text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </Card>
  );
}

export default FaqList;
