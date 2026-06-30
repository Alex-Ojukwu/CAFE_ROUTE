/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern, much smaller formats at the same visual quality.
    formats: ["image/avif", "image/webp"],
    // Allow owner-uploaded images from Supabase Storage to be optimized too.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
