import './AuthHeading.css';

export function AuthHeading(props: { title: string; sub: string }) {
  return (
    <div class="authheading">
      <h1 class="authheading-title">{props.title}</h1>
      <p class="authheading-sub">{props.sub}</p>
    </div>
  );
}

export default AuthHeading;
