import type { IconType } from "react-icons";
import {
  FiAward,
  FiBookOpen,
  FiFolder,
  FiHelpCircle,
  FiHome,
  FiUser,
} from "react-icons/fi";

export type NavKey =
  | "dashboard"
  | "training"
  | "results"
  | "resources"
  | "profile"
  | "support";

export const AGENT_TABS: {
  key: NavKey;
  label: string;
  href: string;
  Icon: IconType;
}[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", Icon: FiHome },
  { key: "training", label: "My Training", href: "/learn", Icon: FiBookOpen },
  { key: "results", label: "My Results", href: "/results", Icon: FiAward },
  { key: "resources", label: "Resources", href: "/resources", Icon: FiFolder },
  { key: "profile", label: "Profile", href: "/profile", Icon: FiUser },
  { key: "support", label: "Support", href: "/support", Icon: FiHelpCircle },
];
