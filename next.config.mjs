/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/studio',
        destination: '/studio/content',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
