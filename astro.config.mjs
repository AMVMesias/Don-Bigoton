import { defineConfig } from 'astro/config';

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export default defineConfig({
  site: process.env.SITE_URL || (deploymentHost ? `https://${deploymentHost}` : undefined),
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
