import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Thêm dòng này để build ra HTML tĩnh
  images: {
    unoptimized: true, // Bắt buộc cho static export
  },
  allowedDevOrigins: ['transpose-conceal-atlantic.ngrok-free.dev'],
};

export default nextConfig;
