/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
      colors: {
        // ── Legacy aliases (keep for backward compat) ──────────────────────
        'bg-dark': '#181A1F',
        'surface-dark': '#3E464E',
        'surface-card': '#242A30',
        'accent-gold': '#E8904B',
 
        // ── Semantic tokens via CSS custom properties ────────────────────────
        // These auto-swap between light/dark via the vars defined in global.css
        'main': 'var(--color-main)',
        'surface': 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'card-fallback': 'var(--color-card-fallback)',
        'border-color': 'var(--color-border-color)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
        'accent': 'var(--color-accent)',
        'accent-dark': 'var(--color-accent-dark)',
        'danger': 'var(--color-danger)',
        'lyric-text': 'var(--color-lyric-text)',
      },
    },
  },
  plugins: [],
}
