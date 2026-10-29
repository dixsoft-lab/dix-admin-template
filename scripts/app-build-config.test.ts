import { describe, expect, it } from "vitest";
import { createAppBuildConfig } from "./app-build-config.mjs";
describe("앱 루트 빌드 계약", () => {
	it("실행 디렉터리와 무관하게 앱 루트를 사용한다", () => {
		expect(createAppBuildConfig("/consumer/apps/admin")).toEqual({
			root: "/consumer/apps/admin",
			base: "/",
			envDir: "/consumer/apps/admin",
			build: { outDir: "/consumer/apps/admin/dist" },
		});
	});
	it("명시한 base와 상대 환경·출력 경로를 적용한다", () => {
		expect(
			createAppBuildConfig("/consumer/apps/admin", {
				APP_BASE_PATH: "/console/",
				APP_ENV_DIR: "../..",
				APP_OUT_DIR: "../../build/admin",
			}),
		).toEqual({
			root: "/consumer/apps/admin",
			base: "/console/",
			envDir: "/consumer",
			build: { outDir: "/consumer/build/admin" },
		});
	});
});
