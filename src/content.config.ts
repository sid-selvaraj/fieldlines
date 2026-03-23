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

export const collections = { research, essays };
