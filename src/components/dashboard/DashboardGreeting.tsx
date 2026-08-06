/** First name only — the full name is on the results certificate, not here. */
export function DashboardGreeting(props: { greeting: string; firstName: string }) {
  return (
    <div class="mb-5">
      <h1 class="m-0 text-xl font-bold tracking-tight text-ink lg:text-2xl">
        {props.greeting}, {props.firstName}! <span aria-hidden="true">👋</span>
      </h1>
      <p class="m-0 mt-0.5 text-sm text-muted">Welcome back! Continue your training journey.</p>
    </div>
  );
}

export default DashboardGreeting;
