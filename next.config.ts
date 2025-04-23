import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   eslint: {
    ignoreDuringBuilds: false,
  },
};
module.exports = {
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig;
