import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createAppBuildConfig } from "./app-build-config.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const argument = process.argv.slice(2);
if (argument.some((value) => value !== "--fixture=forbidden-artifacts")) {
	console.error("알 수 없는 layout 검증 옵션");
	process.exit(1);
}
const fileList = [
	...new Set(
		execFileSync(
			"git",
			["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
			{ cwd: root, encoding: "utf8" },
		)
			.split("\0")
			.filter(Boolean),
	),
];
if (argument.includes("--fixture=forbidden-artifacts"))
	fileList.push(
		".env.test",
		"dist/leaked.js",
		"src/shared/api/firebase/client.ts",
		"src/entity/story/index.ts",
		"src/entity/current-account/api/client.ts",
		"src/entity/current-account/model/product-policy.ts",
	);
const genericContractPathSet = new Set([
	"src/entity/current-account/index.ts",
	"src/entity/current-account/model/current-account.ts",
	"src/entity/current-account/model/permission.ts",
]);
const failureList = [];
for (const layer of ["app", "page", "widget", "feature", "entity", "shared"]) {
	if (!existsSync(resolve(root, "src", layer)))
		failureList.push(`FSD layer 누락: ${layer}`);
}
for (const path of fileList) {
	if (/(^|\/)(\.env[^/]*|dist|node_modules|\.omo)(\/|$)/.test(path))
		failureList.push(`금지 산출물: ${path}`);
	if (
		!genericContractPathSet.has(path) &&
		/^src\/(?:.*\/)?(?:api|query|mutation|schema|firebase|story|moderation|report|manage-account|current-account)(?:\/|\.)/.test(
			path,
		)
	)
		failureList.push(`제품/API 소스 금지: ${path}`);
	if (
		/^src\/.*\.(?:tsx?|jsx?|css)$/.test(path) &&
		existsSync(resolve(root, path))
	) {
		const content = readFileSync(resolve(root, path), "utf8");
		if (
			/firebase|@mi-user-story|miuserstory|@tanstack\/react-query|@sentry|https:\/\/[^\s"']*(?:cloudfunctions|firebase)|storyId|accountTransfer/.test(
				content,
			)
		)
			failureList.push(`제품 의존성 금지: ${path}`);
	}
}
const manifest = JSON.parse(
	readFileSync(resolve(root, "package.json"), "utf8"),
);
for (const dependency of Object.keys({
	...manifest.dependencies,
	...manifest.devDependencies,
})) {
	if (/firebase|@mi-user-story|@sentry|@tanstack\/react-query/.test(dependency))
		failureList.push(`제품 의존성 금지: ${dependency}`);
}
assert.deepEqual(createAppBuildConfig(root, {}), {
	root,
	base: "/",
	envDir: resolve(root),
	build: { outDir: resolve(root, "dist") },
});
if (failureList.length) {
	console.error(failureList.join("\n"));
	process.exit(1);
}
console.log(
	`PASS: FSD 6개 layer, 앱 루트 base/env/output, Git 전달 후보 ${fileList.length}개 파일의 제품/API·산출물 경계`,
);
