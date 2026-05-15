import type { Config } from 'tailwindcss';

// Modern SaaS direction — Stripe/Linear/Vercel aesthetic.
// Bright neutrals, sans-serif throughout, indigo accent, rounded corners,
// subtle shadows.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral scale (slate-tinted)
        ink: {
          DEFAULT: '#0f172a',  // slate-900
          muted: '#475569',     // slate-600
          subtle: '#94a3b8',    // slate-400
        },
        paper: {
          DEFAULT: '#ffffff',
          raised: '#ffffff',
          sunken: '#f8fafc',    // slate-50
        },
        rule: '#e2e8f0',        // slate-200
        // Accent — indigo, used confidently in CTAs and key affordances
        accent: {
          DEFAULT: '#4f46e5',   // indigo-600
          hover: '#4338ca',     // indigo-700
          subtle: '#eef2ff',    // indigo-50
        },
      },
      fontFamily: {
        // Single sans-serif family for everything — Inter is the modern default.
        // No serif. Mono kept for tabular numbers.
        serif: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'hed': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'subhed': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
