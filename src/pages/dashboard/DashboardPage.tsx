import { PromoterShell } from '../../components/common/PromoterShell';
import { DashboardGreeting } from '../../components/dashboard/DashboardGreeting';
import { ProgressCard } from '../../components/dashboard/ProgressCard';
import { ResumeCard } from '../../components/dashboard/ResumeCard';
import { ModuleList } from '../../components/dashboard/ModuleList';
import { InfoPanel } from '../../components/dashboard/InfoPanel';
import { DashboardSection } from '../../components/dashboard/DashboardSection';
import type { Module, Resume } from '../../lib/progress';
import type { Shell } from '../../lib/shell';
import { firstName } from '../../lib/format';

export function DashboardPage(props: {
  shell: Shell;
  modules: Module[];
  resume: Resume;
  /** From `stepFor()` — the same destination the server would redirect to. */
  resumeHref: string;
}) {
  const { shell } = props;

  return (
    <PromoterShell
      title="Dashboard"
      shell={shell}
      active="dashboard"
      rail={<InfoPanel promoter={shell.promoter} />}
      header={
        <DashboardGreeting greeting={shell.greeting} firstName={firstName(shell.promoter.name)} />
      }
    >
      <ProgressCard progress={shell.progress} />

      <DashboardSection title="Continue Where You Left Off">
        <ResumeCard resume={props.resume} href={props.resumeHref} />
      </DashboardSection>

      <DashboardSection title="Training Modules">
        <ModuleList modules={props.modules} />
      </DashboardSection>
    </PromoterShell>
  );
}

export default DashboardPage;
