const appName = process.env.APP_NAME || "OrbitDesk";

module.exports = {
  ssr: false,
  target: "static",
  head: {
    titleTemplate: `%s | ${appName}`,
    title: appName,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content:
          "A thoughtful workspace for planning projects, tracking time, and doing your best work.",
      },
    ],
    link: [{ rel: "icon", type: "image/svg+xml", href: "/orbitdesk-mark.svg" }],
  },
  css: ["@mdi/font/css/materialdesignicons.css", "~/assets/app.scss"],
  plugins: [],
  components: true,
  buildModules: ["@nuxtjs/vuetify"],
  modules: ["@nuxtjs/axios"],
  publicRuntimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:7070",
    appName,
    ownerName: process.env.APP_OWNER || "Jahid Khan",
    demoEmail: process.env.DEMO_EMAIL || "",
    demoPassword: process.env.DEMO_PASSWORD || "",
  },
  axios: {
    baseURL: process.env.API_BASE_URL || "http://localhost:7070",
  },
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    defaultAssets: {
      font: false,
      icons: false,
    },
    icons: { iconfont: "mdi" },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: "#6258e8",
          secondary: "#1a9b82",
          accent: "#ef9f53",
          info: "#4b8ac6",
          warning: "#eda648",
          error: "#d75e6b",
          success: "#269879",
          background: "#f6f7fb",
        },
      },
    },
  },
  build: {
    loaders: {
      sass: {
        sassOptions: { fiber: false },
      },
      scss: {
        sassOptions: { fiber: false },
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 5000,
  },
};
