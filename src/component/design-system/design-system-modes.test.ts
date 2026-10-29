import { execFileSync } from "node:child_process";
import {
	cp,
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	realpath,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, it } from "vitest";
import { build } from "vite";

const sourceRoot = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(sourceRoot, "../../..");
const providerSource = join(sourceRoot, "fixture/provider-package");
let fixtureRoot = "";

beforeAll(async () => {
	fixtureRoot = await realpath(
		await mkdtemp(join(tmpdir(), "dix-design-system-")),
	);
});

afterAll(async () => {
	await rm(fixtureRoot, { recursive: true, force: true });
});

const buildConsumer = async (root: string) => {
	await build({
		configFile: false,
		root,
		logLevel: "silent",
		resolve: { dedupe: ["react", "react-dom"] },
		build: { outDir: join(root, "dist"), minify: false },
	});
	return readdir(join(root, "dist/assets"));
};

it.each(["embedded", "workspace", "external"] as const)(
	"%s consumer가 동일한 facade와 스타일로 production build된다",
	async (mode) => {
		const root = join(fixtureRoot, mode);
		await mkdir(join(root, "node_modules"), { recursive: true });
		await writeFile(
			join(root, "package.json"),
			JSON.stringify({ private: true, type: "module" }),
		);
		if (mode === "external") {
			const npmEnvironment = {
				...process.env,
				npm_config_cache: join(root, "npm-cache"),
			};
			const archiveName = execFileSync(
				"npm",
				["pack", "--silent", "--pack-destination", root],
				{
					cwd: providerSource,
					encoding: "utf8",
					env: npmEnvironment,
				},
			).trim();
			execFileSync(
				"npm",
				[
					"install",
					"--offline",
					"--ignore-scripts",
					"--legacy-peer-deps",
					"--no-package-lock",
					"--no-audit",
					"--no-fund",
					join(root, archiveName),
				],
				{ cwd: root, stdio: "pipe", env: npmEnvironment },
			);
			const packedFileList = execFileSync(
				"tar",
				["-tf", join(root, archiveName)],
				{ encoding: "utf8" },
			);
			expect(packedFileList.split("\n").filter(Boolean).sort()).toEqual([
				"package/index.d.ts",
				"package/index.js",
				"package/package.json",
				"package/styles.css",
			]);
		}
		if (mode === "workspace") {
			const packageRoot = join(root, "package/design-system");
			await cp(providerSource, packageRoot, { recursive: true });
			await symlink(
				packageRoot,
				join(root, "node_modules/dix-admin-fixture-provider"),
				"dir",
			);
		}
		for (const packageName of ["react", "react-dom", "scheduler"]) {
			await symlink(
				join(repositoryRoot, "node_modules", packageName),
				join(root, "node_modules", packageName),
				"dir",
			);
		}
		const providerImport =
			mode === "embedded"
				? ""
				: 'import * as component from "dix-admin-fixture-provider"; import "dix-admin-fixture-provider/styles.css";';
		const selection =
			mode === "embedded"
				? '{ mode: "embedded" }'
				: `{ mode: "${mode}", component }`;
		await writeFile(
			join(root, "index.html"),
			'<div id="root"></div><script type="module" src="./main.tsx"></script>',
		);
		await writeFile(
			join(root, "main.tsx"),
			`import { createElement } from "react"; import { createRoot } from "react-dom/client"; import { DesignSystemProvider, Button, Input, Badge, Skeleton } from ${JSON.stringify(join(sourceRoot, "index.ts"))}; import ${JSON.stringify(join(sourceRoot, "styles.css"))}; ${providerImport} createRoot(document.getElementById("root")).render(createElement(DesignSystemProvider, { selection: ${selection} }, createElement(Button, null, "저장"), createElement(Input, { "aria-label": "이름" }), createElement(Badge, null, "대기"), createElement(Skeleton)));`,
		);
		const assetList = await buildConsumer(root);
		expect(assetList.some((name) => name.endsWith(".js"))).toBe(true);
		const cssName = assetList.find((name) => name.endsWith(".css"));
		if (!cssName) throw new TypeError("CSS build artifact가 없습니다.");
		const css = await readFile(join(root, "dist/assets", cssName), "utf8");
		expect(css).toContain("--dix-admin-color-primary");
		expect(css).toContain(".dix-admin-button");
		console.info(JSON.stringify({ mode, assetList }));
	},
	30_000,
);

it("CSS-only consumer는 React 설치와 JavaScript bundle 없이 token을 소비한다", async () => {
	const root = join(fixtureRoot, "css-only");
	await mkdir(root, { recursive: true });
	await cp(join(sourceRoot, "tokens.css"), join(root, "tokens.css"));
	await writeFile(
		join(root, "package.json"),
		JSON.stringify({ private: true, type: "module" }),
	);
	await writeFile(
		join(root, "index.html"),
		'<link rel="stylesheet" href="./tokens.css"><main class="dix-admin-theme">CSS consumer</main>',
	);
	const assetList = await buildConsumer(root);
	expect(assetList.every((name) => name.endsWith(".css"))).toBe(true);
	const html = await readFile(join(root, "dist/index.html"), "utf8");
	const hasScript = html.includes("<script");
	const hasNodeModules = (await readdir(root)).includes("node_modules");
	expect(hasScript).toBe(false);
	expect(hasNodeModules).toBe(false);
	const cssName = assetList[0];
	if (!cssName) throw new TypeError("CSS token artifact가 없습니다.");
	expect(await readFile(join(root, "dist/assets", cssName), "utf8")).toContain(
		"--dix-admin-color-surface",
	);
	console.info(
		JSON.stringify({ mode: "css-only", assetList, hasNodeModules, hasScript }),
	);
});
