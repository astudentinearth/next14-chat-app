/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["@node-rs/argon2"]
    },
    eslint: {
        ignoreDuringBuilds: true
    },
};

export default nextConfig;
