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
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = await realpath(
	fileURLToPath(new URL("..", import.meta.url)),
);
const argumentList = process.argv.slice(2);
const fixture = argumentList[0]?.replace("--fixture=", "");
const negativeFixtureList = ["missing-design-system", "missing-export"];
if (
	argumentList.length > 1 ||
	(argumentList.length === 1 &&
		!negativeFixtureList.some(
			(name) => argumentList[0] === `--fixture=${name}`,
		))
) {
	console.error("지원하는 fixture: missing-design-system, missing-export");
	process.exit(1);
}

const temporaryRoot = await realpath(
	await mkdtemp(join(tmpdir(), "dix-consumer-")),
);
const evidenceRoot = resolve(
	process.env.CONSUMER_EVIDENCE_DIR ??
		join(repositoryRoot, ".omo/evidence/consumer-modes"),
);
await mkdir(evidenceRoot, { recursive: true });
const sourceRoot = join(temporaryRoot, "source");
const receiptList = [];
const sourceHashRecord = {};
let commandSequence = 0;

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const writeJson = (path, value) =>
	writeFile(path, `${JSON.stringify(value, null, "\t")}\n`);
const hashSource = async (directory, prefix = "") => {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const name = prefix ? `${prefix}/${entry.name}` : entry.name;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) await hashSource(path, name);
		else
			sourceHashRecord[name] = createHash("sha256")
				.update(await readFile(path))
				.digest("hex");
	}
};
const run = async (
	scenario,
	cwd,
	argument,
	extraEnvironment = {},
	expectedStatus = 0,
) => {
	const result = spawnSync("npm", argument, {
		cwd,
		encoding: "utf8",
		timeout: 180_000,
		maxBuffer: 16 * 1024 * 1024,
		env: {
			...process.env,
			PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ""}`,
			APP_BASE_PATH: "/",
			APP_ENV_DIR: ".",
			APP_OUT_DIR: "dist",
			npm_config_audit: "false",
			npm_config_fund: "false",
			...extraEnvironment,
		},
	});
	const logPath = join(
		evidenceRoot,
		`${String(++commandSequence).padStart(2, "0")}-${scenario}.log`,
	);
	await writeFile(
		logPath,
		`$ npm ${argument.join(" ")}\ncwd: ${cwd}\nexit: ${result.status}\n${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.stack ?? ""}`,
	);
	if (result.error) throw result.error;
	assert.equal(
		result.status,
		expectedStatus,
		`${scenario}: npm ${argument.join(" ")} 실패. ${logPath}`,
	);
	console.log(
		`PASS ${scenario}: npm ${argument.join(" ")} (exit ${result.status})`,
	);
	return { output: `${result.stdout ?? ""}${result.stderr ?? ""}`, logPath };
};

const copySource = async (destination) => {
	await mkdir(destination, { recursive: true });
	for (const name of [
		"src",
		"scripts",
		"index.html",
		"vite.config.ts",
		"vitest.config.ts",
		"tsconfig.json",
		"package.json",
		"package-lock.json",
	]) {
		await cp(join(sourceRoot, name), join(destination, name), {
			recursive: true,
		});
	}
};

const verifyConsumer = async (topology, mode, invalidFixture) => {
	const scenario = invalidFixture ?? `${topology}-${mode}`;
	const root = join(temporaryRoot, scenario);
	const nested = topology === "monorepo";
	const appRoot = nested ? join(root, "apps/admin") : root;
	await copySource(appRoot);
	const sourceManifest = await readJson(join(sourceRoot, "package.json"));
	const providerSource = join(
		sourceRoot,
		"src/component/ui/fixture/provider-package",
	);
	const providerManifest = await readJson(join(providerSource, "package.json"));
	const fixtureRoot = join(repositoryRoot, "fixtures/consumer-monorepo");
	let manifest = sourceManifest;
	if (nested) {
		manifest = {
			...(await readJson(join(fixtureRoot, "package.json"))),
			dependencies: { ...sourceManifest.dependencies },
			devDependencies: { ...sourceManifest.devDependencies },
		};
		await writeJson(
			join(appRoot, "package.json"),
			await readJson(join(fixtureRoot, "apps/admin/package.json")),
		);
		await rm(join(appRoot, "package-lock.json"));
	}
	if (mode === "workspace") {
		assert.ok(
			nested,
			"workspace provider는 parent npm workspace에서 검증해야 합니다.",
		);
		await cp(providerSource, join(root, "packages/design-system"), {
			recursive: true,
		});
		manifest.dependencies[providerManifest.name] = providerManifest.version;
	}
	if (mode === "external") {
		const packageRoot = join(temporaryRoot, `${scenario}-package`);
		await cp(providerSource, packageRoot, { recursive: true });
		const vendorRoot = join(root, "vendor");
		await mkdir(vendorRoot, { recursive: true });
		const packed = await run(`${scenario}-pack`, packageRoot, [
			"pack",
			"--json",
			"--pack-destination",
			vendorRoot,
		]);
		const archive = JSON.parse(packed.output)[0].filename;
		manifest.dependencies[providerManifest.name] = `file:vendor/${archive}`;
	}
	await writeJson(join(root, "package.json"), manifest);
	if (nested) {
		const lock = await readJson(join(sourceRoot, "package-lock.json"));
		lock.name = manifest.name;
		lock.version = manifest.version;
		lock.packages[""] = {
			name: manifest.name,
			version: manifest.version,
			workspaces: manifest.workspaces,
			dependencies: manifest.dependencies,
			devDependencies: manifest.devDependencies,
		};
		await writeJson(join(root, "package-lock.json"), lock);
	}
	if (nested || mode !== "embedded") {
		await run(`${scenario}-lock`, root, [
			"install",
			"--package-lock-only",
			"--ignore-scripts",
			"--prefer-offline",
		]);
	}
	assert.equal(
		existsSync(join(root, "node_modules")),
		false,
		"clean install 전에 node_modules가 없어야 합니다.",
	);
	await run(`${scenario}-install`, root, ["ci"]);
	const lock = await readJson(join(root, "package-lock.json"));
	assert.equal(
		lock.packages["node_modules/react-router-dom"].version,
		"7.18.3",
	);
	if (nested) {
		assert.equal(existsSync(join(appRoot, "package-lock.json")), false);
		assert.equal(existsSync(join(appRoot, "node_modules")), false);
		assert.equal(lock.packages["node_modules/dix-admin-consumer"].link, true);
		assert.equal(lock.packages["apps/admin"].dependencies, undefined);
	}
	if (mode === "workspace") {
		assert.equal(
			lock.packages[`node_modules/${providerManifest.name}`].link,
			true,
		);
		assert.equal(
			await realpath(join(root, "node_modules", providerManifest.name)),
			join(root, "packages/design-system"),
		);
	}
	if (mode === "external") {
		assert.ok(lock.packages[`node_modules/${providerManifest.name}`].integrity);
		assert.equal(
			lock.packages[`node_modules/${providerManifest.name}`].link,
			undefined,
		);
	}
	let entry = await readFile(join(fixtureRoot, "consumer-entry.tsx"), "utf8");
	if (mode !== "embedded" || invalidFixture) {
		entry = entry.replace(
			"/* PROVIDER_IMPORT */",
			`import * as component from "${providerManifest.name}";`,
		);
		entry = entry.replace(
			/\/\* PROVIDER_SELECTION \*\/\s*\{\s*mode: "embedded",?\s*\}/,
			`{ mode: "${mode}", component }`,
		);
	}
	await writeFile(join(appRoot, "src/main.tsx"), entry);
	if (invalidFixture === "missing-design-system") {
		await rm(join(root, "node_modules", providerManifest.name), {
			recursive: true,
			force: true,
		});
	}
	if (invalidFixture === "missing-export") {
		const declaration = join(
			root,
			"node_modules",
			providerManifest.name,
			"index.d.ts",
		);
		await writeFile(
			declaration,
			(await readFile(declaration, "utf8")).replace(
				/export const Skeleton:[\s\S]*$/,
				"",
			),
		);
		const implementation = join(
			root,
			"node_modules",
			providerManifest.name,
			"index.js",
		);
		await writeFile(
			implementation,
			(await readFile(implementation, "utf8")).replace(
				/export const Skeleton =[\s\S]*$/,
				"",
			),
		);
	}
	if (invalidFixture) {
		const failure = await run(
			`${scenario}-typecheck`,
			root,
			["run", "typecheck"],
			{},
			2,
		);
		const diagnostic =
			invalidFixture === "missing-design-system"
				? /Cannot find module 'dix-admin-fixture-provider'/
				: /Property 'Skeleton' is missing/;
		assert.match(
			failure.output,
			diagnostic,
			"예상한 package/export 오류로 실패해야 합니다.",
		);
		const guidance =
			invalidFixture === "missing-design-system"
				? "missing-design-system: parent package.json에 provider 의존성을 추가하고 npm install을 실행하세요. workspace이면 packages/design-system 등록을 확인하세요."
				: "missing-export: provider의 index.js/index.d.ts에 Button, Input, Badge, Skeleton export를 모두 제공하세요.";
		await writeFile(
			join(evidenceRoot, `${scenario}-diagnostic.log`),
			`${guidance}\n${failure.output}`,
		);
		console.error(guidance);
		return { scenario, expectedFailure: true, logPath: failure.logPath };
	}
	await run(`${scenario}-typecheck`, root, ["run", "typecheck"]);
	const marker = `DIX_CONSUMER_${scenario.toUpperCase().replaceAll("-", "_")}`;
	const envRoot = nested
		? join(root, "config/admin")
		: join(root, "consumer-env");
	await mkdir(envRoot, { recursive: true });
	await writeFile(
		join(envRoot, ".env.production"),
		`VITE_CONSUMER_MARKER=${marker}\n`,
	);
	const base = nested ? "/console/admin/" : "/";
	const outputRoot = nested
		? join(root, "output/admin")
		: join(root, "consumer-dist");
	const buildEnvironment = {
		APP_BASE_PATH: base,
		APP_ENV_DIR: nested ? "../../config/admin" : "consumer-env",
		APP_OUT_DIR: nested ? "../../output/admin" : "consumer-dist",
	};
	await run(`${scenario}-build`, root, ["run", "build"], buildEnvironment);
	const html = await readFile(join(outputRoot, "index.html"), "utf8");
	assert.match(html, new RegExp(`src="${base}assets/`));
	const assetList = await readdir(join(outputRoot, "assets"));
	const javascript = (
		await Promise.all(
			assetList
				.filter((name) => name.endsWith(".js"))
				.map((name) => readFile(join(outputRoot, "assets", name), "utf8")),
		)
	).join("\n");
	const css = (
		await Promise.all(
			assetList
				.filter((name) => name.endsWith(".css"))
				.map((name) => readFile(join(outputRoot, "assets", name), "utf8")),
		)
	).join("\n");
	assert.ok(
		javascript.includes(marker),
		"envDir override가 build에 반영되어야 합니다.",
	);
	assert.ok(css.includes("--color-primary"));
	assert.ok(css.includes(".bg-primary"));
	if (mode !== "embedded") assert.ok(javascript.includes("data-provider"));
	assert.equal(
		existsSync(join(appRoot, "dist")),
		false,
		"기본 dist 대신 outDir override만 출력해야 합니다.",
	);
	await cp(outputRoot, join(evidenceRoot, scenario, "output"), {
		recursive: true,
	});
	await cp(
		join(root, "package-lock.json"),
		join(evidenceRoot, scenario, "package-lock.json"),
	);
	await cp(
		join(root, "package.json"),
		join(evidenceRoot, scenario, "package.json"),
	);
	if (mode === "external") {
		await cp(join(root, "vendor"), join(evidenceRoot, scenario, "vendor"), {
			recursive: true,
		});
	}
	return {
		scenario,
		topology,
		mode,
		cleanInstall: true,
		parentOwnsDependency: nested,
		base,
		...buildEnvironment,
		assetList,
		marker,
		reactRouter: "7.18.3",
	};
};

try {
	await mkdir(sourceRoot, { recursive: true });
	const sourceFileList = [
		"src",
		"scripts",
		"index.html",
		"vite.config.ts",
		"vitest.config.ts",
		"tsconfig.json",
		"package.json",
		"package-lock.json",
	];
	for (const name of sourceFileList)
		await cp(join(repositoryRoot, name), join(sourceRoot, name), {
			recursive: true,
		});
	await hashSource(sourceRoot);
	if (fixture) {
		receiptList.push(await verifyConsumer("monorepo", "workspace", fixture));
		process.exitCode = 1;
	} else {
		for (const [topology, mode] of [
			["standalone", "embedded"],
			["standalone", "external"],
			["monorepo", "embedded"],
			["monorepo", "workspace"],
			["monorepo", "external"],
		]) {
			receiptList.push(await verifyConsumer(topology, mode));
		}
		for (const invalidFixture of negativeFixtureList)
			receiptList.push(
				await verifyConsumer("monorepo", "workspace", invalidFixture),
			);
		console.log(
			"PASS: standalone 2개·parent workspace 3개 clean install/typecheck/build, provider 실패 2개",
		);
	}
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	try {
		await writeJson(
			join(evidenceRoot, fixture ? `${fixture}-receipt.json` : "receipt.json"),
			{
				node: process.version,
				sourceLockSha256: sourceHashRecord["package-lock.json"] ?? null,
				sourceHashRecord,
				receiptList,
				exitCode: process.exitCode ?? 0,
			},
		);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
}
