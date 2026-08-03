import { Layout } from '../../components/common/Layout';
import { AuthSplit } from '../../components/auth/AuthSplit';
import { StartForm, type StartValues } from '../../components/auth/StartForm';

export function StartPage(props: { values?: StartValues; errors?: Record<string, string> }) {
  return (
    <Layout title="Get started" variant="auth">
      <AuthSplit>
        <h1>Sales Promoter Training</h1>
        <p class="lede">
          A short training on commission, credit checks and conduct rules, then a quiz. About 15
          minutes.
        </p>
        <StartForm values={props.values} errors={props.errors} />
      </AuthSplit>
    </Layout>
  );
}

export default StartPage;
