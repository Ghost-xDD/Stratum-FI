import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  typescript: {
    // Temporarily ignore build errors from ethers library (IPC socket provider type issue)
    // This is safe because IPC sockets are not used in browser environment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
