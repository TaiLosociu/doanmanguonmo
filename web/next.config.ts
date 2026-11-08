import type { NextConfig } from "next";
import path from "node:path";

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const basePath = rawBasePath
  ? rawBasePath.startsWith("/")
    ? rawBasePath.replace(/\/$/, "")
    : `/${rawBasePath.replace(/\/$/, "")}`
  : undefined;

const nextConfig: NextConfig = {
  basePath,
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
