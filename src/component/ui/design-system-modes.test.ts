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
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const sourceRoot = fileURLToPath(new URL(".", import.meta.url));
const repositoryRoot = resolve(sourceRoot, "../../..");
const providerSource = join(sourceRoot, "fixture/provider-package");
let fixtureRoot = "";

beforeAll(async () => {
	fixtureRoot = await realpath(
		await mkdtemp(join(tmpdir(), "design-system-provider-")),
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
		plugins: [tailwindcss()],
		resolve: {
			alias: { "@": resolve(repositoryRoot, "src") },
			dedupe: ["react", "react-dom"],
		},
		build: { outDir: join(root, "dist"), minify: false },
	});
	return readdir(join(root, "dist/assets"));
};

it.each(["embedded", "workspace", "external"] as const)(
	"%s provider가 공통 facade contract와 Tailwind theme로 production build된다",
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
				{ cwd: providerSource, encoding: "utf8", env: npmEnvironment },
			).trim();
			const packedFileList = execFileSync(
				"tar",
				["-tf", join(root, archiveName)],
				{ encoding: "utf8" },
			);
			expect(packedFileList.split("\n").filter(Boolean).sort()).toEqual([
				"package/index.d.ts",
				"package/index.js",
				"package/package.json",
			]);
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
		for (const packageName of ["react", "react-dom", "scheduler"])
			await symlink(
				join(repositoryRoot, "node_modules", packageName),
				join(root, "node_modules", packageName),
				"dir",
			);
		const providerImport =
			mode === "embedded"
				? ""
				: 'import * as component from "dix-admin-fixture-provider";';
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
			`import { createElement } from "react"; import { createRoot } from "react-dom/client"; import { DesignSystemProvider } from ${JSON.stringify(join(sourceRoot, "DesignSystemProvider.tsx"))}; import { Button } from ${JSON.stringify(join(sourceRoot, "Button.tsx"))}; import { Input } from ${JSON.stringify(join(sourceRoot, "Input.tsx"))}; import { Badge } from ${JSON.stringify(join(sourceRoot, "Badge.tsx"))}; import { Skeleton } from ${JSON.stringify(join(sourceRoot, "Skeleton.tsx"))}; import ${JSON.stringify(join(repositoryRoot, "src/style/tailwind.css"))}; ${providerImport} createRoot(document.getElementById("root")).render(createElement(DesignSystemProvider, { selection: ${selection} }, createElement("main", { className: "bg-canvas p-6" }, createElement(Button, null, "저장"), createElement(Input, { "aria-label": "이름" }), createElement(Badge, null, "대기"), createElement(Skeleton))));`,
		);
		const assetList = await buildConsumer(root);
		expect(assetList.some((name) => name.endsWith(".js"))).toBe(true);
		const cssName = assetList.find((name) => name.endsWith(".css"));
		if (!cssName)
			throw new TypeError("Tailwind CSS build artifact가 없습니다.");
		const css = await readFile(join(root, "dist/assets", cssName), "utf8");
		expect(css).toContain("--color-primary");
		expect(css).toContain(".bg-primary");
		expect(css).toContain("prefers-reduced-motion: reduce");
		console.info(JSON.stringify({ mode, assetList }));
	},
	30_000,
);
