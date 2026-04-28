import {
  Briefcase,
  Code2,
  Eye,
  MailPlus,
  type LucideIcon,
} from 'lucide-react';

export type PromptMode = {
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export const PROMPT_MODES: PromptMode[] = [
  { label: 'Build a business', icon: Briefcase, isActive: true },
  { label: 'Create a prototype', icon: Code2 },
  { label: 'Monitor the situation', icon: Eye },
  { label: 'Lead generation', icon: MailPlus },
];

export const SUGGESTED_QUESTIONS = [
  'Build a financial model for my startup',
  'Write a one-page investor pitch',
  'Size the market for my business idea',
];
