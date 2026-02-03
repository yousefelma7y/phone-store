/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ No 'output: export' if you want middleware
  experimental: {
    // Ensure App Router is enabled if using `app/`
    appDir: true,
  },
};

module.exports = nextConfig;
