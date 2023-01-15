/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'files.stripe.com',
      's3-alpha-sig.figma.com',
      'pbs.twimg.com'
    ]
  }
}

module.exports = nextConfig
