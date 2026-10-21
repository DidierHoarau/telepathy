// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["@devopsplaybook.io/common-web"],
  ssr: false,
  app: {
    head: {
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      title: "Telepathy",
      meta: [
        { name: "description", content: "Telepathy — lightweight shell automation" },
        { name: "theme-color", content: "#0b1220" },
      ],
      link: [
        { rel: "icon", href: "/icon.png" },
        { rel: "apple-touch-icon", href: "/icon.png" },
      ],
    },
  },
  css: [
    "bootstrap-icons/font/bootstrap-icons.css",
    "~/assets/css/tokens.css",
    "~/assets/css/base.css",
    "~/assets/css/main.css",
  ],
  modules: ["@pinia/nuxt", "@vite-pwa/nuxt"],
  imports: {
    dirs: ["./stores"],
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Telepathy",
      short_name: "Telepathy",
      lang: "en-US",
      start_url: "/tasks",
      display: "standalone",
      background_color: "#0b1220",
      theme_color: "#0b1220",
      icons: [
        {
          src: "images/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },
});
