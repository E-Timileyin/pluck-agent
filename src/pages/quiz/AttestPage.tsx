import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { ConductRules } from '../../components/quiz/ConductRules';
import { AttestForm } from '../../components/quiz/AttestForm';
import type { Shell } from '../../lib/shell';

export function AttestPage(props: { shell: Shell; error?: string }) {
  return (
    <PromoterShell title="Confirmation" shell={props.shell} active="training" showRail>
      <h1>Before you see your result</h1>
      <p class="lede">
        These four rules carry real consequences, up to suspension and legal action.
      </p>
      {props.error ? <Alert tone="error">{props.error}</Alert> : null}
      <ConductRules />
      <AttestForm />
    </PromoterShell>
  );
}

export default AttestPage;
