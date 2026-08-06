import type { IconType } from 'react-icons';
import { FiActivity, FiGrid, FiHelpCircle, FiSettings, FiUsers } from 'react-icons/fi';

export type AdminNavKey = 'overview' | 'attempts' | 'promoters' | 'questions' | 'settings';

/**
 * The whole console is these five screens — nothing here is ever disabled.
 *
 * Attempts is its own destination rather than a block at the bottom of the
 * overview: the overview is sized to one screen, and a 200-row table is not
 * something you scroll past to reach anything else.
 *
 * Kept apart from the rail that draws them so the shell can name the active
 * section in its heading without importing the navigation itself.
 */
export const ADMIN_TABS: { key: AdminNavKey; label: string; href: string; Icon: IconType }[] = [
  { key: 'overview', label: 'Overview', href: '/admin', Icon: FiGrid },
  { key: 'attempts', label: 'Attempts', href: '/admin/attempts', Icon: FiActivity },
  { key: 'promoters', label: 'Sales Agents', href: '/admin/promoters', Icon: FiUsers },
  { key: 'questions', label: 'Questions', href: '/admin/questions', Icon: FiHelpCircle },
  { key: 'settings', label: 'Settings', href: '/admin/settings', Icon: FiSettings },
];
