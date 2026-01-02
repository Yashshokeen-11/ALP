/**
 * Utility functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function masteryColor(score: number): string {
  if (score >= 0.8) return 'text-green-600 dark:text-green-400';
  if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 0.4) return 'text-orange-600 dark:text-orange-400';
  return 'text-destructive';
}

export function masteryBgColor(score: number): string {
  if (score >= 0.8) return 'bg-green-100 dark:bg-green-900/20';
  if (score >= 0.6) return 'bg-yellow-100 dark:bg-yellow-900/20';
  if (score >= 0.4) return 'bg-orange-100 dark:bg-orange-900/20';
  return 'bg-destructive/10';
}

