import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const booklet = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/booklet" }),
    schema: z.object({
        title: z.string(),
    }),
});

export const collections = { booklet };