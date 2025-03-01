/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
})

const nextConfig = {
  // Existing MDX configuration
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
  },
  
  // GitHub Pages configuration
  output: 'export',        // Exports your app as static HTML
  images: {
    unoptimized: true,     // Required for static export
  },
  basePath: '',            // Base path for your site (leave empty for root)
  trailingSlash: true,     // Adds trailing slashes to URLs (helps with static routing)
}

module.exports = withMDX(nextConfig)