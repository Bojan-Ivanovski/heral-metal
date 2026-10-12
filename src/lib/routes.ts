export type Language = 'mk' | 'en';
export type Page = 'home' | 'services' | 'projects' | 'about' | 'contact' | 'quote' | 'privacy' | 'services/metal-structures' | 'services/machine-maintenance' | 'services/gas-pipelines';
export const pages: Page[] = ['home', 'services', 'services/metal-structures', 'services/machine-maintenance', 'services/gas-pipelines', 'projects', 'about', 'contact', 'quote', 'privacy'];
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const asset = (path: string) => `${base}/${path.replace(/^\//, '')}`;
export const route = (page: Page | '404', lang: Language = 'mk') => `${base}/${lang === 'en' ? 'en/' : ''}${page === 'home' ? '' : `${page}/`}`;
export const absolute = (path: string) => new URL(path, import.meta.env.SITE).href;
