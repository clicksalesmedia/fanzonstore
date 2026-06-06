import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every <Image> goes through our custom loader (lib/image-loader.ts), which
    // routes remote Printify/S3 mockups to the /api/img proxy (resizes to WebP +
    // long immutable cache) and passes local /images/* assets through untouched.
    // This replaces the old `unoptimized:true` (slow full-size S3 JPGs) without
    // re-triggering the optimizer's private-IP/NAT64 host block, because the
    // proxy does the upstream fetch itself.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    minimumCacheTTL: 31536000,
    qualities: [75],
    // Still declared so any direct (non-loader) usage and the proxy allowlist
    // stay documented in one place.
    remotePatterns: [
      { protocol: "https", hostname: "images.printify.com" },
      { protocol: "https", hostname: "images-api.printify.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default nextConfig;
