// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server',
  site: 'https://sidselvaraj.science',
  devToolbar: { enabled: false },
  adapter: cloudflare(),
  integrations: [react()],
});
