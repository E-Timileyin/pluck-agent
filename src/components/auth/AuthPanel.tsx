import type { IconType } from 'react-icons';
import { FiAward, FiCreditCard, FiZap } from 'react-icons/fi';
import './AuthPanel.css';

const FEATURES: { Icon: IconType; title: string; copy: string }[] = [
  { Icon: FiZap, title: 'Instant Access', copy: 'Start learning right away' },
  { Icon: FiCreditCard, title: 'Clear Commission', copy: 'Know exactly what you earn' },
  { Icon: FiAward, title: 'Grow Your Career', copy: 'Build skills that matter' },
];

/** Desktop only — hidden below the split breakpoint by AuthPanel.css. */
export function AuthPanel() {
  return (
    <aside class="authpanel">
      {/*<img class="authpanel-logo" src="/logo-dark.png" alt="Pluck" />*/}

      <div class="authpanel-body">
        <h2 class="authpanel-title">
          Power Your Dreams
          <br />
          With Pluck
        </h2>
        <p class="authpanel-blurb">
          Everything a Pluck promoter needs to know about commission, credit checks and conduct —
          in about fifteen minutes.
        </p>

        <ul class="authpanel-features">
          {FEATURES.map(({ Icon, title, copy }) => (
            <li class="authfeature">
              <span class="authfeature-icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span>
                <span class="authfeature-title">{title}</span>
                <span class="authfeature-copy">{copy}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p class="authpanel-foot">© {new Date().getUTCFullYear()} Pluck. All rights reserved.</p>
    </aside>
  );
}

export default AuthPanel;
