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
        primary: "#1E5F8C",          // Civic Blue
        accent: "#E8A33D",           // Warm Amber
        "severity-low": "#4CAF7D",   // Muted Green
        "severity-medium": "#E8A33D", // Amber (re-uses accent)
        "severity-high": "#D64545",   // Muted Red
        "bg-light": "#F7F9FB",        // Off-White
        "bg-dark": "#1A1D21",         // Charcoal
        "text-primary": "#1F2937",    // Near-Black
        "text-secondary": "#6B7280",   // Slate Gray
        success: "#2F9E5B",
        error: "#C0392B",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        button: "6px",
      },
    },
  },
  plugins: [],
}
