import { Alert } from '../common/Alert';
import './LoginForm.css';

/** One shared secret, no audit trail. Not authentication — replace before rollout. */
export function LoginForm(props: { error?: string }) {
  return (
    <div class="login">
      {props.error ? <Alert tone="error">{props.error}</Alert> : null}
      <form method="post" action="/admin/login" class="card stack narrow">
        <label class="field">
          <span class="label">Passcode</span>
          <input name="passcode" type="password" autocomplete="current-password" required autofocus />
        </label>
        <button class="btn btn-primary" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
