// Central design tokens — mirrors CSS variables in globals.css
// Use these for dynamic values in JS; use CSS vars for static styling.

export const colors = {
  // Brand
  brand:        '#7c3aed',
  brandHover:   '#6d28d9',
  brandSubtle:  'rgba(124, 58, 237, 0.12)',
  // Semantic
  success:      '#22c55e',
  error:        '#ef4444',
  warning:      '#f59e0b',
  info:         '#3b82f6',
  // Confetti palette
  confetti:     ['#7c3aed', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6'],
} as const;

export const transitions = {
  base:   '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow:   '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const radius = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
} as const;

export const spacing = {
  4: '4px', 8: '8px', 12: '12px', 16: '16px',
  24: '24px', 32: '32px', 48: '48px', 64: '64px',
} as const;

export const typography = {
  sizes: {
    xs: '12px', sm: '14px', base: '16px', lg: '18px',
    xl: '20px', '2xl': '24px', '3xl': '30px',
  },
  weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625 },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.5)',
} as const;
