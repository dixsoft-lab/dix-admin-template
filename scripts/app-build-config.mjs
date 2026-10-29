import { resolve } from "node:path";
export const createAppBuildConfig = (appRoot, environment = {}) => ({
	root: appRoot,
	base: environment.APP_BASE_PATH ?? "/",
	envDir: resolve(appRoot, environment.APP_ENV_DIR ?? "."),
	build: { outDir: resolve(appRoot, environment.APP_OUT_DIR ?? "dist") },
});
