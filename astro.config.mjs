// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  site: 'https://sidselvaraj.science',
  devToolbar: { enabled: false },
  adapter: cloudflare(),
});