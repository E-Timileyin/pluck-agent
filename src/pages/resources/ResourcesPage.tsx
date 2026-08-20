import { PromoterShell } from "../../components/common/PromoterShell";
import { PageHeader } from "../../components/common/PageHeader";
import { MaterialCard } from "../../components/resources/MaterialCard";
import { ConductReference } from "../../components/resources/ConductReference";
import { QuickFacts } from "../../components/resources/QuickFacts";
import type { Module } from "../../lib/progress";
import type { Shell } from "../../lib/shell";

export function ResourcesPage(props: {
  shell: Shell;
  modules: Module[];
  questionCount: number;
  criticalCount: number;
}) {
  const { settings } = props.shell;

  return (
    <PromoterShell
      title="Resources"
      shell={props.shell}
      active="resources"
      wide
      header={
        <PageHeader
          title="Resources"
          sub="The training material, the rules, and what the quiz expects of you."
        />
      }
    >
      <div class="grid gap-3 md:grid-cols-2">
        {props.modules.map((module) => (
          <MaterialCard module={module} />
        ))}

        <QuickFacts
          passMark={settings.passMark}
          minTutorialSeconds={settings.minTutorialSeconds}
          questionCount={props.questionCount}
          criticalCount={props.criticalCount}
        />

        <ConductReference />
      </div>
    </PromoterShell>
  );
}

export default ResourcesPage;
