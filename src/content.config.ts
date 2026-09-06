import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const seoFields = {
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
};

const products = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/products' }),
  schema: z.object({
    name: z.string(), slug: z.string(), category: z.string(), summary: z.string(), description: z.string(),
    featured: z.boolean().default(false), order: z.number().default(99), price: z.string().optional(),
    applications: z.array(z.string()).default([]), specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    heroImage: z.string().optional(), gallery: z.array(z.object({ image: z.string(), alt: z.string() })).default([]),
    ...seoFields,
  }),
});
const services = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/services' }),
  schema: z.object({
    name: z.string(), slug: z.string(), summary: z.string(), description: z.string(), featured: z.boolean().default(false),
    order: z.number().default(99), deliverables: z.array(z.string()).default([]), idealFor: z.array(z.string()).default([]),
    heroImage: z.string().optional(), gallery: z.array(z.object({ image: z.string(), alt: z.string() })).default([]), ...seoFields,
  }),
});
const projects = defineCollection({ loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/projects' }) });
const testimonials = defineCollection({ loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/testimonials' }) });
const videos = defineCollection({ loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/videos' }) });
const faqs = defineCollection({ loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/faqs' }) });
const pages = defineCollection({ loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/pages' }) });
const settings = defineCollection({ loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/settings' }) });

export const collections = { products, services, projects, testimonials, videos, faqs, pages, settings };
