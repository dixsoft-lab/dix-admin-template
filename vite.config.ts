import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { createAppBuildConfig } from "./scripts/app-build-config.mjs";
export default defineConfig({
	...createAppBuildConfig(import.meta.dirname, process.env),
	plugins: [react()],
	resolve: { alias: { "@admin": resolve(import.meta.dirname, "src") } },
	server: { host: "127.0.0.1", strictPort: true },
});
