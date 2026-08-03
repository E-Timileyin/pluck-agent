import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { ConductRules } from '../../components/quiz/ConductRules';
import { AttestForm } from '../../components/quiz/AttestForm';

export function AttestPage(props: { error?: string }) {
  return (
    <Layout title="Confirmation" step="quiz">
      <h1>Before you see your result</h1>
      <p class="lede">
        These four rules carry real consequences, up to suspension and legal action.
      </p>
      {props.error ? <Alert tone="error">{props.error}</Alert> : null}
      <ConductRules />
      <AttestForm />
    </Layout>
  );
}

export default AttestPage;
