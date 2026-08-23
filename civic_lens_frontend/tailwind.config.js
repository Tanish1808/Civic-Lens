/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: "#10263A",              // Deep Survey Ink
        "ink-muted": "#2E475D",      // Subdued Survey Slate
        paper: "#F6F2E9",            // Warm Paper Background
        "paper-card": "#EFEAE0",     // Raised Paper Card Surface
        "paper-sheet": "#FAF7F0",    // Light Paper Sheet
        "ink-line": "#D8D2C2",       // Hairline Grid Line / Divider
        "ink-border": "#C4BCAB",     // Defined Paper Border
        primary: "#1E5F8C",          // Civic Blue
        accent: "#E8A33D",           // Signal Amber / Stamp
        "severity-low": "#4CAF7D",   // Inspection Green
        "severity-medium": "#E8A33D", // Inspection Amber
        "severity-high": "#D64545",   // Inspection Red
        "bg-light": "#F7F9FB",        // Off-White (legacy compat)
        "bg-dark": "#1A1D21",         // Charcoal (legacy compat)
        "text-primary": "#1F2937",    // Near-Black
        "text-secondary": "#6B7280",   // Slate Gray
        success: "#2F9E5B",
        error: "#C0392B",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ['"Space Grotesk"', 'sans-serif'],
        stencil: ['"Big Shoulders Stencil"', 'cursive', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: "8px",
        button: "6px",
      },
    },
  },
  plugins: [],
}
