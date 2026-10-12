import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

const repository = process.env.GITHUB_REPOSITORY || 'Bojan-Ivanovski/heral-metal';
const [owner, name] = repository.split('/');
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || `https://${owner}.github.io`,
  base: process.env.BASE_PATH || (name === `${owner}.github.io` ? '/' : `/${name}`),
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
});
