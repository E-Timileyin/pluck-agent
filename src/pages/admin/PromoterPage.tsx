import { FiArrowLeft, FiInbox } from 'react-icons/fi';
import { AdminShell } from '../../components/admin/AdminShell';
import { PromoterCard } from '../../components/admin/PromoterCard';
import { AttemptHistory } from '../../components/admin/AttemptHistory';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { DashboardSection } from '../../components/dashboard/DashboardSection';
import type { Admin, Answer, Attempt, Promoter } from '../../db/schema';

export function PromoterPage(props: {
  admin: Admin;
  promoter: Promoter;
  attempts: Attempt[];
  answersByAttempt: Map<string, Answer[]>;
  /** Photo upload timestamp, used as the image URL's cache key. */
  photoAt?: string | null;
}) {
  return (
    <AdminShell
      title={props.promoter.name}
      active="promoters"
      admin={props.admin}
      heading={props.promoter.name}
      sub="Every attempt this sales agent has made, and what they answered."
      actions={
        <Button tone="ghost" href="/admin/promoters">
          <FiArrowLeft size={18} />
          All sales agents
        </Button>
      }
    >
      <PromoterCard
        promoter={props.promoter}
        attempts={props.attempts}
        photoAt={props.photoAt}
      />

      <DashboardSection title="History">
        {props.attempts.length === 0 ? (
          <EmptyState
            Icon={FiInbox}
            title="No attempts yet"
            copy="This sales agent exists because they filled in the start form, but has not begun the training."
          />
        ) : (
          <AttemptHistory attempts={props.attempts} answersByAttempt={props.answersByAttempt} />
        )}
      </DashboardSection>
    </AdminShell>
  );
}

export default PromoterPage;
