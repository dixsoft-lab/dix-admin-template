import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
export default defineConfig({
	resolve: { alias: { "@admin": resolve(import.meta.dirname, "src") } },
	test: {
		environment: "node",
		include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
	},
});
