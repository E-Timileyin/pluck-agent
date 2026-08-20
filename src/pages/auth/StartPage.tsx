import { FiAward, FiCreditCard, FiZap } from "react-icons/fi";
import { AuthLayout, type AuthFeature } from "../../components/auth/AuthLayout";
import { StartForm, type StartValues } from "../../components/auth/StartForm";

const FEATURES: AuthFeature[] = [
  { Icon: FiZap, title: "Instant access", copy: "Start learning right away" },
  {
    Icon: FiCreditCard,
    title: "Clear commission",
    copy: "Know exactly what you earn",
  },
  {
    Icon: FiAward,
    title: "Grow your career",
    copy: "Build skills that matter",
  },
];

export function StartPage(props: {
  values?: StartValues;
  errors?: Record<string, string>;
  error?: string;
}) {
  return (
    <AuthLayout
      title="Get started"
      heading="Welcome back!"
      sub="Sign in with the Sales Agent ID, phone and email of your pluck sales agent app"
      panelTitle="Power Your Dreams With Pluck"
      panelCopy="Everything a Pluck sales agent needs to know about commission, credit checks and conduct — in about fifteen minutes."
      features={FEATURES}
      art="/login-art.png"
    >
      <StartForm
        values={props.values}
        errors={props.errors}
        error={props.error}
      />
    </AuthLayout>
  );
}

export default StartPage;
