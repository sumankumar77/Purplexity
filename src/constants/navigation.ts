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
  isActive?: boolean;
};

export const TOP_NAV_ITEMS = ['Discover', 'Finance', 'Health', 'Academic', 'Patents'];

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'New', icon: Plus, isActive: true },
  { label: 'Computer', icon: Monitor },
  { label: 'Spaces', icon: SquareLibrary },
  { label: 'Customise', icon: Settings },
  { label: 'History', icon: History },
];

export const RECENT_THREADS: string[] = [];
