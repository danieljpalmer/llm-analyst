// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      link: [
        {
          rel: "icon",
          href: "/favicon.png",
          type: "image/x-icon",
        },
      ],
    },
  },
});