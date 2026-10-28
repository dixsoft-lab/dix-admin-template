import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const argumentList = process.argv.slice(2);
const fixture = argumentList[0];
const fixtureList = ["--fixture=invalid-provider", "--fixture=missing-export"];

if (argumentList.length > 1 || (fixture && !fixtureList.includes(fixture))) {
	console.error("지원하는 fixture: invalid-provider, missing-export");
	process.exit(1);
}

if (!fixture) {
	const result = spawnSync(
		process.execPath,
		[
			resolve(root, "node_modules/vitest/vitest.mjs"),
			"run",
			"src/shared/design-system/DesignSystemProvider.test.tsx",
			"src/shared/design-system/design-system-modes.test.ts",
		],
		{ cwd: root, stdio: "inherit" },
	);
	if (result.error) throw result.error;
	process.exit(result.status ?? 1);
}

const outputRoot = await mkdtemp(join(tmpdir(), "dix-provider-negative-"));
try {
	await build({
		configFile: false,
		root,
		logLevel: "silent",
		ssr: { noExternal: true },
		build: {
			ssr: resolve(root, "src/shared/design-system/resolve-design-system.ts"),
			outDir: outputRoot,
			rollupOptions: { output: { entryFileNames: "provider.mjs" } },
		},
	});
	const { resolveDesignSystem } = await import(
		pathToFileURL(join(outputRoot, "provider.mjs")).href
	);
	const selection =
		fixture === "--fixture=invalid-provider"
			? { mode: "invalid" }
			: { mode: "external", component: {} };
	resolveDesignSystem(selection);
	console.error("잘못된 provider fixture가 거부되지 않았습니다.");
	process.exitCode = 2;
} catch (error) {
	if (!(error instanceof Error)) throw error;
	if (error.name !== "DesignSystemConfigurationError") throw error;
	console.error(error.message);
	process.exitCode = 1;
} finally {
	await rm(outputRoot, { recursive: true, force: true });
}
