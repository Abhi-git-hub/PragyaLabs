import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Phase 1 asset pipeline: prefer AVIF/WebP, responsive sizes.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  experimental: {
    // Keep client JS lean; 3D/motion load dynamically per route.
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei", "gsap"],
  },
};

export default nextConfig;
