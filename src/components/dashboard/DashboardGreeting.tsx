/** First name only — the full name is on the results certificate, not here. */
export function DashboardGreeting(props: { greeting: string; firstName: string }) {
  return (
    <div class="mb-8">
      <h1 class="m-0 mb-1 text-[28px] font-bold tracking-tight text-ink lg:text-[36px]">
        {props.greeting}, {props.firstName}! <span aria-hidden="true">👋</span>
      </h1>
      <p class="m-0 text-base text-muted">Welcome back! Continue your training journey.</p>
    </div>
  );
}

export default DashboardGreeting;
