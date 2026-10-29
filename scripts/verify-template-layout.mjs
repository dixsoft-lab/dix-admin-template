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
			.filter(
				(path) =>
					path && !path.startsWith(".omo/") && existsSync(resolve(root, path)),
			),
	),
];
if (argument.includes("--fixture=forbidden-artifacts"))
	fileList.push(
		".env.test",
		"dist/leaked.js",
		"src/platform/firebase/client.ts",
		"src/domains/story/index.ts",
		"src/contract/authentication/api/client.ts",
		"src/contract/authorization/api/product-client.ts",
	);
const genericContractPathSet = new Set([
	"src/contract/authentication/auth-adapter.ts",
	"src/contract/authentication/authenticated-user.ts",
	"src/contract/authorization/permission-adapter.ts",
	"src/contract/navigation/navigation-contract.ts",
]);
const failureList = [];
for (const role of [
	"app",
	"page",
	"layout",
	"component",
	"contract",
	"hook",
	"route",
	"style",
]) {
	if (!existsSync(resolve(root, "src", role)))
		failureList.push(`책임 역할 누락: ${role}`);
}
for (const legacyRole of [
	"pages",
	"layouts",
	"components",
	"contracts",
	"hooks",
	"routing",
	"styles",
	"widget",
	"feature",
	"entity",
	"shared",
])
	if (existsSync(resolve(root, "src", legacyRole)))
		failureList.push(`이전 역할 폴더가 남아 있습니다: ${legacyRole}`);
for (const legacyPath of ["src/layout/admin", "src/component/design-system"])
	if (existsSync(resolve(root, legacyPath)))
		failureList.push(`중복 역할 폴더가 남아 있습니다: ${legacyPath}`);
for (const path of fileList) {
	if (/(^|\/)(\.env[^/]*|dist|node_modules|\.omo)(\/|$)/.test(path))
		failureList.push(`금지 산출물: ${path}`);
	const isDemoSourcePath =
		path.startsWith("src/app/demo/") || path.startsWith("src/page/demo/");
	if (
		!isDemoSourcePath &&
		!genericContractPathSet.has(path) &&
		/^src\/(?:.*\/)?(?:api|query|mutation|schema|firebase|story|moderation|report|manage-account)(?:\/|\.)/.test(
			path,
		)
	)
		failureList.push(`제품/API 소스 금지: ${path}`);
	if (/^src\/.*\/index\.(?:ts|tsx)$/.test(path))
		failureList.push(`FSD barrel 파일은 허용하지 않습니다: ${path}`);
	if (/^src\/.*\.css$/.test(path) && path !== "src/style/tailwind.css")
		failureList.push(
			`Tailwind 진입점 외 CSS 파일은 허용하지 않습니다: ${path}`,
		);
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
	`PASS: 책임 역할 8개, 앱 루트 base/env/output, Git 전달 후보 ${fileList.length}개 파일의 제품/API·산출물 경계`,
);
