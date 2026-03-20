import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans:    ["'Outfit'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-up":     "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "modal-enter": "modal-enter 0.4s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        "fade-up":     { from:{ opacity:"0", transform:"translateY(24px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        "modal-enter": { from:{ opacity:"0", transform:"translateY(20px) scale(0.97)" }, to:{ opacity:"1", transform:"translateY(0) scale(1)" } },
      },
    },
  },
  plugins: [],
} satisfies Config;