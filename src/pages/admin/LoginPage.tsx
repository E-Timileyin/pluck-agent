import { Layout } from '../../components/common/Layout';
import { LoginForm } from '../../components/admin/LoginForm';

export function LoginPage(props: { error?: string }) {
  return (
    <Layout title="Admin" variant="admin">
      <h1>Admin</h1>
      <LoginForm error={props.error} />
    </Layout>
  );
}

export default LoginPage;
