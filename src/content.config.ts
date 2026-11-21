import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const posts = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './content/posts' }),
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        date: z.string().or(z.date()),
        author: z.string().default('Linus Fischer'),
        slug: z.string().optional(),
        image: z.string().optional(),
        desc: z.string().optional(),
        description: z.string().optional(),
        banner: z
            .object({
                enabled: z.boolean().optional(),
                until: z.string().optional(),
                text: z.string().optional(),
                badge: z.string().optional(),
                link: z.string().optional(),
                variant: z.string().optional(),
                dismissible: z.boolean().optional(),
            })
            .optional(),
        bannerUntil: z.string().optional(),
        bannerText: z.string().optional(),
        bannerBadge: z.string().optional(),
        bannerLink: z.string().optional(),
        bannerVariant: z.string().optional(),
        bannerDismissible: z.boolean().optional(),
        event: z
            .object({
                name: z.string().optional(),
                startDate: z.string().optional(),
                endDate: z.string().optional(),
                eventAttendanceMode: z.string().optional(),
                eventStatus: z.string().optional(),
                location: z
                    .object({
                        name: z.string().optional(),
                        description: z.string().optional(),
                        hasMap: z.string().optional(),
                        geo: z
                            .object({
                                latitude: z.number().optional(),
                                longitude: z.number().optional(),
                            })
                            .optional(),
                        address: z
                            .object({
                                streetAddress: z.string().optional(),
                                addressLocality: z.string().optional(),
                                postalCode: z.string().optional(),
                                addressCountry: z.string().optional(),
                            })
                            .optional(),
                    })
                    .optional(),
                isAccessibleForFree: z.boolean().optional(),
            })
            .optional(),
    }),
});

const pages = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './content/pages' }),
    schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        desc: z.string().optional(),
    }),
});

const gruppen = defineCollection({
    loader: glob({ pattern: '**/*.mdx', base: './content/gruppen' }),
    schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        desc: z.string().optional(),
    }),
});

export const collections = { posts, pages, gruppen };
