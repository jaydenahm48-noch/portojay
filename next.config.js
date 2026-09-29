/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                pathname: '/uc/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
        ],
    },
    // Disable body parser untuk API routes yang handle file upload
    // (dikonfigurasi per-route, bukan global)
};

module.exports = nextConfig;
