import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    status: z.enum(['Draft', 'In Progress', 'Published']),
    abstract: z.string(),
    tags: z.array(z.string()),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    readTime: z.number(),
    tags: z.array(z.string()),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    event: z.string(),
    eventUrl: z.string().optional(),
    location: z.string(),
    award: z.string().optional(),
    awardLevel: z.string().optional(),
    category: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()),
    heroImage: z.string().optional(),
    images: z.array(z.string()).optional(),
    pdfAttachment: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { research, essays, journal };
