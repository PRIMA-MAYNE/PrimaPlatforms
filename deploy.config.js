// Production Deployment Configuration

const deployConfig = {
  // Build configuration
  build: {
    outputDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext'
  },

  // Performance optimization
  performance: {
    hints: 'warning',
    maxAssetSize: 500000,
    maxEntrypointSize: 500000
  },

  // Environment variables for production
  env: {
    production: {
      VITE_APP_URL: 'https://your-domain.com',
      NODE_ENV: 'production'
    },
    staging: {
      VITE_APP_URL: 'https://staging.your-domain.com',
      NODE_ENV: 'staging'
    }
  },

  // Hosting platforms
  platforms: {
    netlify: {
      buildCommand: 'npm run build',
      publishDir: 'dist',
      redirects: [
        {
          from: '/*',
          to: '/index.html',
          status: 200
        }
      ]
    },
    vercel: {
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      rewrites: [
        {
          source: '/(.*)',
          destination: '/index.html'
        }
      ]
    },
    github_pages: {
      buildCommand: 'npm run build',
      publishDir: 'dist',
      base: '/catalyst-education/'
    }
  }
};

module.exports = deployConfig;
