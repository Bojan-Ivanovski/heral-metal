import type { APIRoute } from 'astro';
import { absolute, asset } from '../lib/routes';
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\nSitemap: ${absolute(asset('sitemap.xml'))}\n`, { headers: { 'Content-Type': 'text/plain' } });
