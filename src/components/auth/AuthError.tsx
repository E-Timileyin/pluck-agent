/** The one-line failure above a sign-in form. Never says which field was wrong. */
export function AuthError(props: { message?: string }) {
  if (!props.message) return null;

  return (
    <p
      class="m-0 mb-4 rounded-xl bg-[#ffe6e0] px-4 py-3 text-sm font-semibold text-miss"
      role="alert"
    >
      {props.message}
    </p>
  );
}

export default AuthError;
