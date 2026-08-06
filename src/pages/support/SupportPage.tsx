import { PromoterShell } from '../../components/common/PromoterShell';
import { PageHeader } from '../../components/common/PageHeader';
import { ContactCard } from '../../components/support/ContactCard';
import { FaqList, type Faq } from '../../components/support/FaqList';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import type { Shell } from '../../lib/shell';
import { formatClock } from '../../lib/format';

export function SupportPage(props: { shell: Shell; questionCount: number }) {
  const { settings, progress } = props.shell;

  /* Every answer is a fact about this deployment, not generic help text. */
  const faqs: Faq[] = [
    {
      question: 'Why is the Continue button still counting down?',
      answer: `The quiz unlocks after ${formatClock(settings.minTutorialSeconds)} on the material. The countdown is only a display — the check happens on the server, so refreshing the page does not skip it.`,
    },
    {
      question: 'Can I switch between the slides and the video?',
      answer: 'Yes, as often as you like. The timer is started once and switching format never resets it.',
    },
    {
      question: 'What counts as a pass?',
      answer: `${settings.passMark}% or better across ${props.questionCount} ${props.questionCount === 1 ? 'question' : 'questions'}, and every compliance question answered correctly. Missing one compliance question means you have not passed, whatever the total.`,
    },
    {
      question: 'Can I go back and change an answer?',
      answer: 'No. An answer is scored the moment you submit it, and the question you were asked is stored with it, so a later edit to the quiz cannot change your result.',
    },
    {
      question: 'I did not pass. What now?',
      answer: 'Take it again — attempts are unlimited and every one is kept. Your result screen shows the correct answer for everything you missed.',
    },
    {
      question: 'My name or phone number is wrong.',
      answer: 'You can correct your name, email and tier on the Profile screen. The phone number identifies your record across attempts and only a supervisor can change it.',
    },
  ];

  return (
    <PromoterShell
      title="Support"
      shell={props.shell}
      active="support"
      wide
      header={
        <PageHeader title="Support" sub="How this training works, and who to ask when it does not." />
      }
    >
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <ContactCard phone={settings.supportPhone} email={settings.supportEmail} />
        </div>

        <Card tone="tint" title="Still stuck?">
          <p class="m-0 mb-3 text-[13px]/[1.6] text-ink">
            Nothing you have done is lost. Your answers are saved as you give them, and you are on
            the <strong>{progress.current}</strong> step — you can pick up exactly where you left
            off.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button href="/dashboard" small>
              Dashboard
            </Button>
            <Button tone="ghost" href="/resources" small>
              The material
            </Button>
          </div>
        </Card>

        <div class="lg:col-span-3">
          <FaqList faqs={faqs} />
        </div>
      </div>
    </PromoterShell>
  );
}

export default SupportPage;
