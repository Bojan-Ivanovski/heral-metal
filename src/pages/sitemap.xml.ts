import type { APIRoute } from 'astro';
import { absolute, pages, route } from '../lib/routes';
export const GET: APIRoute = () => {
  const urls = (['mk', 'en'] as const).flatMap(lang => pages.map(page => `<url><loc>${absolute(route(page, lang))}</loc><xhtml:link rel="alternate" hreflang="mk" href="${absolute(route(page, 'mk'))}"/><xhtml:link rel="alternate" hreflang="en" href="${absolute(route(page, 'en'))}"/></url>`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
