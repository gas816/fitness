import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import uvUI from "@climblee/uv-ui";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  app.use(uvUI);
  return { app };
}
