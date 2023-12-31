import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    tailwind(),
  ],

  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },

    remarkPlugins: [
      [remarkToc, {  }]
    ],
  }
});
