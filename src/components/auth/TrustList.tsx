import type { IconType } from 'react-icons';
import { FiAward, FiBookOpen, FiShield } from 'react-icons/fi';
import './TrustList.css';

const ITEMS: { Icon: IconType; title: string; copy: string }[] = [
  { Icon: FiShield, title: 'Complete Training', copy: 'Learn, take the quiz and get certified.' },
  { Icon: FiAward, title: 'Grow Your Career', copy: 'Build skills and unlock new opportunities.' },
  { Icon: FiBookOpen, title: 'One Sitting', copy: 'About fifteen minutes, on the phone in your hand.' },
];

/** Phone only, and only when the viewport is tall enough — see TrustList.css. */
export function TrustList() {
  return (
    <ul class="trustlist">
      {ITEMS.map(({ Icon, title, copy }) => (
        <li class="trust">
          <span class="trust-icon" aria-hidden="true">
            <Icon size={24} />
          </span>
          <span class="trust-body">
            <span class="trust-title">{title}</span>
            <span class="trust-copy">{copy}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TrustList;
