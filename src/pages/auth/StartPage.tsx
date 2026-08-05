import { Layout } from '../../components/common/Layout';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthHeading } from '../../components/auth/AuthHeading';
import { StartForm, type StartValues } from '../../components/auth/StartForm';
import { TrustList } from '../../components/auth/TrustList';

export function StartPage(props: { values?: StartValues; errors?: Record<string, string> }) {
  return (
    <Layout title="Get started" variant="auth">
      <AuthShell>
        <AuthHeading
          title="Welcome back!"
          sub="Sign in with your phone number to continue your training journey."
        />
        <StartForm values={props.values} errors={props.errors} />
        <TrustList />
      </AuthShell>
    </Layout>
  );
}

export default StartPage;
