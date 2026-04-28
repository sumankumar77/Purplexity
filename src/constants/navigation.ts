import {
  History,
  Monitor,
  Plus,
  Settings,
  SquareLibrary,
  type LucideIcon,
} from 'lucide-react';

export type SidebarItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  isActive?: boolean;
};

export type TopNavItem = {
  label: string;
  path: string;
};

export const TOP_NAV_ITEMS: TopNavItem[] = [
  { label: 'Discover', path: '#discover' },
  { label: 'Finance', path: '#finance' },
  { label: 'Health', path: '#health' },
  { label: 'Academic', path: '#academic' },
  { label: 'Patents', path: '#patents' },
];

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'New', icon: Plus, path: '#new', isActive: true },
  { label: 'Computer', icon: Monitor, path: '#computer' },
  { label: 'Spaces', icon: SquareLibrary, path: '#spaces' },
  { label: 'Customise', icon: Settings, path: '#customise' },
  { label: 'History', icon: History, path: '#history' },
];

export const RECENT_THREADS: string[] = [];
