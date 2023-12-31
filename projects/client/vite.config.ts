import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
    babel: {
      plugins: [
        'babel-plugin-macros'
      ]
    }
  }),
  dynamicImport(),
  sentryVitePlugin({
    org: "scipio-finances",
    project: process.env.SENTRY_CLIENT_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    disable: !process.env.SENTRY_AUTH_TOKEN
  })],
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
