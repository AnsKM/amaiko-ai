import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Uncomment the lines below if deploying to a subpath (e.g., username.github.io/repo-name)
  // basePath: '/amaiko-ai',
  // assetPrefix: '/amaiko-ai',
};

export default nextConfig;
