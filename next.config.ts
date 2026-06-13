import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_PAGES_REPO ?? "nyrokume.dev";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: `/${repoName}`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
