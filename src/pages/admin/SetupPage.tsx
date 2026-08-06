import { FiKey, FiShield, FiUserPlus } from 'react-icons/fi';
import { AuthLayout, type AuthFeature } from '../../components/auth/AuthLayout';
import { AdminSetupForm } from '../../components/auth/AdminSetupForm';

const FEATURES: AuthFeature[] = [
  { Icon: FiUserPlus, title: 'Named accounts', copy: 'One login each, not a shared secret' },
  { Icon: FiKey, title: 'Setup key', copy: 'Proves this deployment is yours' },
  { Icon: FiShield, title: 'Invite the rest', copy: 'Add colleagues from Settings later' },
];

/** Shown in place of the sign-in form while the admins table is empty. */
export function SetupPage(props: {
  values?: { name?: string; email?: string };
  errors?: Record<string, string>;
  error?: string;
}) {
  return (
    <AuthLayout
      title="Set up the console"
      heading="Create the first admin"
      sub="This screen disappears once one account exists."
      panelTitle="Set Up The Console"
      panelCopy="Nobody administers this training yet. Create the first account and you can invite the rest of the team from Settings."
      features={FEATURES}
      art="/login-art.png"
    >
      <AdminSetupForm values={props.values} errors={props.errors} error={props.error} />
    </AuthLayout>
  );
}

export default SetupPage;
