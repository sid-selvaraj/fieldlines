import { defineCollection, z } from 'astro:content';

const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    status: z.enum(['Draft', 'In Progress', 'Published']),
    abstract: z.string(),
    tags: z.array(z.string()),
  }),
});

const essays = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    readTime: z.number(),
    tags: z.array(z.string()),
  }),
});

export const collections = { research, essays };
