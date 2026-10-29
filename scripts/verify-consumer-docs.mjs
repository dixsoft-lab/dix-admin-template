import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
	cp,
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	realpath,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("..", import.meta.url)));
const guidePath = join(root, ".agents/references/consumer-guide.md");
const argumentList = process.argv.slice(2);
const fixture = argumentList[0]?.replace("--fixture=", "");
const fixtureList = ["broken-link", "invalid-provider-example"];
if (
	argumentList.length > 1 ||
	(argumentList.length === 1 && !argumentList[0].startsWith("--fixture=")) ||
	(fixture && !fixtureList.includes(fixture))
) {
	console.error("지원하는 fixture: " + fixtureList.join(", "));
	process.exit(1);
}
const evidenceRoot = resolve(
	process.env.CONSUMER_DOCS_EVIDENCE_DIR ??
		join(root, ".omo/evidence/consumer-docs"),
);
await mkdir(evidenceRoot, { recursive: true });
const receiptList = [];
let temporaryRoot;
let commandIndex = 0;
let guideHash;
let sourceLockHash;
let verifierHash;
const writeJson = (path, value) =>
	writeFile(path, JSON.stringify(value, null, "\t") + "\n");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const hash = (value) => createHash("sha256").update(value).digest("hex");
const runNpm = async (
	name,
	cwd,
	argument,
	expectedStatus = 0,
	environment = {},
) => {
	const result = spawnSync("npm", argument, {
		cwd,
		encoding: "utf8",
		timeout: 180_000,
		maxBuffer: 16 * 1024 * 1024,
		env: {
			...process.env,
			PATH: dirname(process.execPath) + delimiter + (process.env.PATH ?? ""),
			ADMIN_BASE_PATH: "/",
			ADMIN_ENV_DIR: ".",
			ADMIN_OUT_DIR: "dist",
			npm_config_audit: "false",
			npm_config_fund: "false",
			...environment,
		},
	});
	const logPath = join(
		evidenceRoot,
		String(++commandIndex).padStart(2, "0") + "-" + name + ".log",
	);
	await writeFile(
		logPath,
		"$ npm " +
			argument.join(" ") +
			"\ncwd: " +
			cwd +
			"\nexit: " +
			result.status +
			"\n" +
			(result.stdout ?? "") +
			(result.stderr ?? "") +
			(result.error?.stack ?? ""),
	);
	receiptList.push({
		name,
		argument,
		status: result.status,
		expectedStatus,
		logPath,
	});
	if (result.error) throw result.error;
	assert.equal(result.status, expectedStatus, name + " 실패: " + logPath);
	console.log("PASS " + name + " (exit " + result.status + ")");
	return result;
};
const getBlockMap = (guide, kind) => {
	const pattern = new RegExp(
		"<!-- consumer-" +
			kind +
			": ([a-z-]+) -->\\s*\\x60{3}(?:tsx?|sh)\\n([\\s\\S]*?)\\x60{3}",
		"g",
	);
	const result = new Map();
	for (const match of guide.matchAll(pattern)) {
		assert.ok(
			!result.has(match[1]),
			"consumer-guide.md: 중복 예제 " + match[1],
		);
		result.set(match[1], {
			source: match[2],
			line: guide.slice(0, match.index).split("\n").length,
		});
	}
	return result;
};
const getCommandList = (block) => {
	assert.ok(block, "consumer-guide.md: 실행 command block이 없습니다.");
	return block.source
		.trim()
		.split("\n")
		.map((line) => {
			assert.match(
				line,
				/^npm (?:[a-zA-Z0-9:._=-]+ ?)+$/,
				"허용되지 않은 문서 명령: " + line,
			);
			return line.slice(4).trim().split(/\s+/);
		});
};
const copyList = [
	"src",
	"scripts",
	"index.html",
	"vite.config.ts",
	"vitest.config.ts",
	"tsconfig.json",
	"package.json",
	"package-lock.json",
];
const mainSource = [
	'import { createRoot } from "react-dom/client";',
	'import { App } from "@admin/app/App";',
	'import { ConsumerApp, type ConsumerRuntime } from "@admin/app/ConsumerApp";',
	'import { selection } from "@admin/app/provider";',
	'import { adminRoutePath } from "@admin/route";',
	'import type { AdminRouteElementMap } from "@admin/app/route";',
	"const runtime: ConsumerRuntime = {",
	' auth: { state: { kind: "anonymous" }, login: () => {}, logout: () => {} },',
	" permission: { capabilityList: [], allows: () => false },",
	' brand: { title: "문서 검증" },',
	' navigationList: [{ path: adminRoutePath.overview, label: "개요" }],',
	"};",
	'const page: Omit<AdminRouteElementMap, "shell"> = {',
	' login: <h1 data-consumer-docs="consumer-docs-marker">로그인 연결 위치</h1>,',
	" overview: <h1>개요</h1>, list: <h1>목록</h1>, create: <h1>생성</h1>,",
	" detail: <h1>상세</h1>, notFound: <h1>페이지 없음</h1>,",
	"};",
	"const Consumer = () => <ConsumerApp runtime={runtime} page={page} selection={selection} />;",
	'const element = document.getElementById("root");',
	'if (!element) throw new Error("root가 없습니다.");',
	"createRoot(element).render(<App consumer={Consumer} />);",
	"",
].join("\n");

try {
	let guide = await readFile(guidePath, "utf8");
	guideHash = hash(guide);
	verifierHash = hash(await readFile(fileURLToPath(import.meta.url)));
	if (fixture === "broken-link")
		guide += "\n[깨진 링크](./missing-consumer-guide.md)\n";
	const sectionList = [
		"Standalone 시작",
		"Monorepo workspace로 배치",
		"Design-system provider 선택",
		"Framework-neutral CSS와 theme",
		"Auth·Permission·Navigation·Brand 조립",
		"Route와 basename 확장",
		"제품 기능과 데이터 흐름",
		"Demo에서 production으로 전환",
		"검증과 증거",
	];
	for (const section of sectionList)
		assert.ok(
			guide.includes("## " + section + "\n"),
			"consumer-guide.md: 필수 절 누락: " + section,
		);
	let linkCount = 0;
	for (const match of guide.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
		const href = match[1].split("#")[0];
		if (!href || /^[a-z]+:/i.test(href)) continue;
		const path = resolve(dirname(guidePath), decodeURIComponent(href));
		const line = guide.slice(0, match.index).split("\n").length;
		assert.ok(
			!relative(root, path).startsWith("..") && existsSync(path),
			"consumer-guide.md:" + line + ": 깨진 로컬 링크 " + href,
		);
		linkCount += 1;
	}
	const exampleMap = getBlockMap(guide, "example");
	for (const key of [
		"consumer-app",
		"provider-embedded",
		"provider-workspace",
		"provider-external",
	])
		assert.ok(exampleMap.has(key), "consumer-guide.md: 실행 예제 누락: " + key);
	if (fixture === "invalid-provider-example") {
		const block = exampleMap.get("provider-external");
		assert.ok(
			block.source.includes('mode: "external"'),
			"provider-external fixture 대상이 없습니다.",
		);
		block.source = block.source.replace('mode: "external"', 'mode: "invalid"');
	}
	const commandMap = getBlockMap(guide, "command");
	const standaloneCommandList = getCommandList(commandMap.get("standalone"));
	const workspaceCommandList = getCommandList(commandMap.get("workspace"));
	for (const [name, commandList] of [
		["standalone", standaloneCommandList],
		["workspace", workspaceCommandList],
	]) {
		const workspaceArgument =
			name === "workspace" ? ["--workspace=dix-admin-consumer"] : [];
		assert.deepEqual(
			commandList,
			[
				["ci"],
				["run", "typecheck", ...workspaceArgument],
				["run", "build", ...workspaceArgument],
			],
			"consumer-guide.md: " +
				name +
				"는 허용된 clean install·typecheck·build 명령만 실행할 수 있습니다.",
		);
	}
	console.log(
		"PASS: 필수 절 " +
			sectionList.length +
			"개·로컬 링크 " +
			linkCount +
			"개·실행 예제 4개",
	);
	temporaryRoot = await realpath(
		await mkdtemp(join(tmpdir(), "dix-consumer-docs-")),
	);
	const sourceRoot = join(temporaryRoot, "source");
	await mkdir(sourceRoot);
	for (const name of copyList)
		await cp(join(root, name), join(sourceRoot, name), { recursive: true });
	sourceLockHash = hash(await readFile(join(sourceRoot, "package-lock.json")));
	const sourceManifest = await readJson(join(sourceRoot, "package.json"));
	const providerSource = join(
		sourceRoot,
		"src/component/design-system/fixture/provider-package",
	);
	const providerManifest = await readJson(join(providerSource, "package.json"));
	const topologyList = fixture ? ["standalone"] : ["standalone", "workspace"];
	for (const topology of topologyList) {
		const nested = topology === "workspace";
		const consumerRoot = join(temporaryRoot, topology);
		const appRoot = nested ? join(consumerRoot, "apps/admin") : consumerRoot;
		await mkdir(appRoot, { recursive: true });
		for (const name of copyList)
			await cp(join(sourceRoot, name), join(appRoot, name), {
				recursive: true,
			});
		let manifest = structuredClone(sourceManifest);
		if (nested) {
			manifest = {
				...(await readJson(
					join(root, "fixtures/consumer-monorepo/package.json"),
				)),
				dependencies: { ...sourceManifest.dependencies },
				devDependencies: { ...sourceManifest.devDependencies },
			};
			await writeJson(
				join(appRoot, "package.json"),
				await readJson(
					join(root, "fixtures/consumer-monorepo/apps/admin/package.json"),
				),
			);
			await rm(join(appRoot, "package-lock.json"));
			await cp(providerSource, join(consumerRoot, "packages/design-system"), {
				recursive: true,
			});
			manifest.dependencies[providerManifest.name] = providerManifest.version;
		} else {
			const vendorRoot = join(consumerRoot, "vendor");
			await mkdir(vendorRoot);
			const packed = await runNpm(topology + "-pack", providerSource, [
				"pack",
				"--json",
				"--pack-destination",
				vendorRoot,
			]);
			const archive = JSON.parse(packed.stdout)[0].filename;
			manifest.dependencies[providerManifest.name] = "file:vendor/" + archive;
		}
		await writeJson(join(consumerRoot, "package.json"), manifest);
		const lock = await readJson(join(sourceRoot, "package-lock.json"));
		lock.name = manifest.name;
		lock.version = manifest.version;
		lock.packages[""] = {
			name: manifest.name,
			version: manifest.version,
			...(nested ? { workspaces: manifest.workspaces } : {}),
			dependencies: manifest.dependencies,
			devDependencies: manifest.devDependencies,
		};
		await writeJson(join(consumerRoot, "package-lock.json"), lock);
		await runNpm(topology + "-lock", consumerRoot, [
			"install",
			"--package-lock-only",
			"--ignore-scripts",
			"--offline",
		]);
		await writeFile(
			join(appRoot, "src/app/ConsumerApp.tsx"),
			exampleMap.get("consumer-app").source,
		);
		await writeFile(
			join(appRoot, "src/app/provider-embedded.ts"),
			exampleMap.get("provider-embedded").source,
		);
		const selectedBlock = exampleMap.get(
			nested ? "provider-workspace" : "provider-external",
		);
		await writeFile(join(appRoot, "src/app/provider.ts"), selectedBlock.source);
		await writeFile(join(appRoot, "src/main.tsx"), mainSource);
		assert.equal(
			existsSync(join(consumerRoot, "node_modules")),
			false,
			"clean install 이전 node_modules가 존재합니다.",
		);
		const commandList = nested ? workspaceCommandList : standaloneCommandList;
		await runNpm(topology + "-install", consumerRoot, commandList[0]);
		if (fixture === "invalid-provider-example") {
			const result = await runNpm(
				topology + "-invalid-example",
				consumerRoot,
				commandList[1],
				2,
			);
			assert.match(
				result.stdout + result.stderr,
				/Type '"invalid"' is not assignable/,
			);
			throw new Error(
				"consumer-guide.md:" +
					selectedBlock.line +
					": provider-external의 mode가 DesignSystemSelection에 맞지 않습니다. src/app/provider.ts 진단을 확인하세요.",
			);
		}
		await runNpm(topology + "-typecheck", consumerRoot, commandList[1]);
		const base = nested ? "/admin/" : "/";
		await runNpm(topology + "-build", consumerRoot, commandList[2], 0, {
			ADMIN_BASE_PATH: base,
		});
		const html = await readFile(join(appRoot, "dist/index.html"), "utf8");
		assert.ok(
			html.includes('src="' + base + "assets/"),
			"문서 consumer base URL이 build에 반영되지 않았습니다.",
		);
		const assetList = await readdir(join(appRoot, "dist/assets"));
		const javascript = (
			await Promise.all(
				assetList
					.filter((name) => name.endsWith(".js"))
					.map((name) => readFile(join(appRoot, "dist/assets", name), "utf8")),
			)
		).join("\n");
		assert.ok(
			javascript.includes("consumer-docs-marker"),
			"문서의 ConsumerApp이 production entry에 포함되지 않았습니다.",
		);
		const installedLock = await readJson(
			join(consumerRoot, "package-lock.json"),
		);
		if (nested) {
			assert.equal(existsSync(join(appRoot, "package-lock.json")), false);
			assert.equal(existsSync(join(appRoot, "node_modules")), false);
			assert.equal(
				installedLock.packages["node_modules/" + providerManifest.name].link,
				true,
			);
			assert.equal(
				await realpath(
					join(consumerRoot, "node_modules", providerManifest.name),
				),
				join(consumerRoot, "packages/design-system"),
			);
		} else {
			assert.ok(
				installedLock.packages["node_modules/" + providerManifest.name]
					.integrity,
			);
			assert.equal(
				installedLock.packages["node_modules/" + providerManifest.name].link,
				undefined,
			);
		}
		await cp(join(appRoot, "dist"), join(evidenceRoot, topology, "dist"), {
			recursive: true,
		});
		await cp(
			join(appRoot, "src/app/ConsumerApp.tsx"),
			join(evidenceRoot, topology, "ConsumerApp.tsx"),
		);
		await cp(
			join(appRoot, "src/app/provider.ts"),
			join(evidenceRoot, topology, "provider.ts"),
		);
		await cp(
			join(consumerRoot, "package-lock.json"),
			join(evidenceRoot, topology, "package-lock.json"),
		);
	}
	console.log(
		"PASS: 문서 adapter/provider 예제를 clean standalone·workspace에서 typecheck/build했습니다.",
	);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
} finally {
	try {
		await writeJson(
			join(evidenceRoot, (fixture ?? "positive") + "-receipt.json"),
			{
				node: process.version,
				fixture: fixture ?? null,
				guideSha256: guideHash ?? null,
				verifierSha256: verifierHash ?? null,
				sourceLockSha256: sourceLockHash ?? null,
				temporaryRoot: temporaryRoot ?? null,
				receiptList,
				exitCode: process.exitCode ?? 0,
			},
		);
	} finally {
		if (temporaryRoot)
			await rm(temporaryRoot, { recursive: true, force: true });
	}
}
