import { resolve } from "node:path";
export const createAppBuildConfig = (appRoot, environment = {}) => ({
	root: appRoot,
	base: environment.ADMIN_BASE_PATH ?? "/",
	envDir: resolve(appRoot, environment.ADMIN_ENV_DIR ?? "."),
	build: { outDir: resolve(appRoot, environment.ADMIN_OUT_DIR ?? "dist") },
});
