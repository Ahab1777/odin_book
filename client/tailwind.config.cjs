module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lime: "var(--color-lime)",
        slate: "var(--color-slate)",
        indigo: "var(--color-indigo)",
        brown: "var(--color-brown)",
        rose: "var(--color-rose)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        mutedText: "var(--color-muted-text)",
        accent: "var(--color-accent)",
      },
      
      boxShadow: {
        card: "0 6px 16px rgba(45,48,71,0.06)",
      },
    },
  },
  plugins: [],
};
