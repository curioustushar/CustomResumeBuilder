import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    // File parsing (existing)
    "unpdf",
    "mammoth",
    "@react-pdf/renderer",
    // Optional AI provider SDKs — only loaded when the matching env var is set.
    // Listed here so Next.js doesn't try to bundle them at build time.
    "@ai-sdk/anthropic",
    "@ai-sdk/google",
  ],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
