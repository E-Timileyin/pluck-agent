/** The full-width primary action every sign-in card ends with. */
export function AuthSubmit(props: { children?: string }) {
  return (
    <button
      class="mt-1 flex h-13 w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-brand text-base font-semibold text-white transition-colors duration-150 hover:bg-brand-deep"
      type="submit"
    >
      {props.children}
    </button>
  );
}

export default AuthSubmit;
