/** @type {import('next').NextConfig} */
const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const nextConfig = {
  async headers() {
    return [
      { source: '/app/:path*', headers: noindex },
      { source: '/admin/:path*', headers: noindex },
      { source: '/auth/:path*', headers: noindex },
    ];
  },
};

export default nextConfig;
