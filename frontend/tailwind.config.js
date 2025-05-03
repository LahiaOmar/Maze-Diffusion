// tailwind.config.js
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [],
  experimental: {
    optimizeUniversalDefaults: true,
  },
  // ⬇️ force legacy color format
  future: {
    useOklch: false, // disables oklch output in Tailwind v3.4+
  },
}
