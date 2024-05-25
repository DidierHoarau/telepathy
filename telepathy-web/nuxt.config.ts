// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      charset: "utf-16",
      viewport:
        "width=device-width, initial-scale=1, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      title: "FeedWatcher",
      meta: [
        { name: "description", content: "FeedWatcher" },
        { name: "theme-color", content: "#212121" },
      ],
      link: [
        { rel: "manifest", href: "/manifest.json" },
        { rel: "icon", href: "/icon.png" },
        { rel: "stylesheet", href: "/styles.css" },
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt", "@vite-pwa/nuxt"],
  imports: {
    dirs: ["./stores"],
  },
  pinia: {
    autoImports: ["defineStore", "acceptHMRUpdate"],
  },
  pwa: {
    name: "Telepathy",
    short_name: "Telepathy",
    lang: "en-US",
    start_url: "/tasks",
    display: "standalone",
    background_color: "white",
    theme_color: "#212121",
    icons: [
      {
        src: "images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
});
