import type { IconType } from 'react-icons';
import { FiAward, FiBookOpen, FiFolder, FiHelpCircle, FiHome, FiUser } from 'react-icons/fi';

export type NavKey = 'dashboard' | 'training' | 'results' | 'resources' | 'profile' | 'support';

/**
 * Every screen a sales agent can reach, in the order both navigations show
 * them: the desktop sidebar and the phone's hamburger panel read from this one
 * list, so a tab can never exist in one and not the other.
 *
 * `/results` is the index rather than a specific attempt on purpose: it exists
 * before anything has been submitted and says so, which beats a nav item that
 * is dead until the very last step.
 */
export const AGENT_TABS: { key: NavKey; label: string; href: string; Icon: IconType }[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', Icon: FiHome },
  { key: 'training', label: 'My Training', href: '/learn', Icon: FiBookOpen },
  { key: 'results', label: 'My Results', href: '/results', Icon: FiAward },
  { key: 'resources', label: 'Resources', href: '/resources', Icon: FiFolder },
  { key: 'profile', label: 'Profile', href: '/profile', Icon: FiUser },
  { key: 'support', label: 'Support', href: '/support', Icon: FiHelpCircle },
];
