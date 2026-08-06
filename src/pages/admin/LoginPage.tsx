import { FiBarChart2, FiEdit3, FiUsers } from 'react-icons/fi';
import { AuthLayout, type AuthFeature } from '../../components/auth/AuthLayout';
import { AdminLoginForm } from '../../components/auth/AdminLoginForm';

/** What the console is for, in the panel's three lines. */
const FEATURES: AuthFeature[] = [
  { Icon: FiUsers, title: 'Every attempt', copy: 'Who trained, who passed, who stalled' },
  { Icon: FiEdit3, title: 'Author the quiz', copy: 'Questions, order and pass mark' },
  { Icon: FiBarChart2, title: 'Spot the gaps', copy: 'The question everybody gets wrong' },
];

export function LoginPage(props: {
  values?: { email: string };
  errors?: Record<string, string>;
  error?: string;
}) {
  return (
    <AuthLayout
      title="Admin sign in"
      heading="Admin sign in"
      sub="Use the account your team set up for the console."
      panelTitle="The Training Console"
      panelCopy="Track every sales agent's progress, author the quiz and set the rules the training runs by."
      features={FEATURES}
      art="/login-art.png"
      footer={
        <>
          Taking the training instead?{' '}
          <a class="font-semibold text-brand no-underline hover:underline" href="/">
            Sales agent sign-in
          </a>
        </>
      }
    >
      <AdminLoginForm values={props.values} errors={props.errors} error={props.error} />
    </AuthLayout>
  );
}

export default LoginPage;
