import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	writeFileSync,
	lstatSync,
	rmSync,
	symlinkSync,
	unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { skillAssetPathList, skillNameList } from "./install-agent-kit.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temp = mkdtempSync(join(tmpdir(), "dix-agent-kit-"));
const evidence = resolve(
	process.env.DIX_AGENT_KIT_EVIDENCE_DIR ||
		mkdtempSync(join(tmpdir(), "dix-agent-kit-evidence-")),
);
mkdirSync(evidence, { recursive: true });
const env = {
	...process.env,
	HOME: join(temp, "home"),
	npm_config_cache: join(temp, "cache"),
	XDG_CONFIG_HOME: join(temp, "config"),
	XDG_DATA_HOME: join(temp, "data"),
	CODEX_HOME: join(temp, "codex"),
	DISABLE_TELEMETRY: "1",
	CI: "1",
};
for (const path of [
	env.HOME,
	env.XDG_CONFIG_HOME,
	env.XDG_DATA_HOME,
	env.CODEX_HOME,
])
	mkdirSync(path, { recursive: true });
const snapshot = (path) => {
	const map = {};
	const walk = (directory, prefix = "") => {
		if (!existsSync(directory)) return;
		for (const name of readdirSync(directory).sort()) {
			const full = join(directory, name);
			assert(
				!lstatSync(full).isSymbolicLink(),
				`예상하지 않은 symlink: ${full}`,
			);
			if (lstatSync(full).isDirectory()) walk(full, `${prefix}${name}/`);
			else
				map[`${prefix}${name}`] = createHash("sha256")
					.update(readFileSync(full))
					.digest("hex");
		}
	};
	walk(path);
	return map;
};
const resultList = [];
const run = (name, binary, argumentList, cwd, expected = 0) => {
	const result = spawnSync(binary, argumentList, {
		cwd,
		env,
		encoding: "utf8",
		timeout: 180000,
	});
	writeFileSync(
		join(evidence, `${name}.log`),
		`$ ${binary} ${argumentList.join(" ")}\ncwd=${cwd}\nexit=${result.status}\n${result.stdout || ""}${result.stderr || ""}${result.error || ""}`,
	);
	resultList.push({ name, binary, argumentList, cwd, exit: result.status });
	assert.equal(
		result.status,
		expected,
		`${name}: ${join(evidence, `${name}.log`)}`,
	);
	return result;
};
const fixtureName = process.argv[2]?.replace("--fixture=", "");
assert(
	process.argv.length <= 3 &&
		(!fixtureName ||
			[
				"consumer-with-existing-agents",
				"malformed-managed-marker",
				"global-install-request",
			].includes(fixtureName)),
	"알 수 없는 fixture입니다.",
);
const install = (name, target, extra = [], expected = 0) =>
	run(
		name,
		process.execPath,
		[join(root, "scripts/install-agent-kit.mjs"), "--target", target, ...extra],
		target,
		expected,
	);
try {
	for (const name of fixtureName
		? [fixtureName]
		: [
				"consumer-with-existing-agents",
				"malformed-managed-marker",
				"global-install-request",
			]) {
		const target = join(temp, name);
		cpSync(join(root, "fixtures/consumer-agent-kit", name), target, {
			recursive: true,
		});
		const before = snapshot(target);
		if (name !== "consumer-with-existing-agents") {
			const rejected = install(
				name,
				target,
				name === "global-install-request" ? ["--global"] : [],
				1,
			);
			const diagnostic =
				name === "global-install-request"
					? /전역 설치는 지원하지 않습니다/
					: /AGENTS\.md managed marker가 손상되었습니다/;
			assert.match(
				rejected.stderr,
				diagnostic,
				"예상한 원인으로 거부되지 않았습니다.",
			);
			assert.deepEqual(
				snapshot(target),
				before,
				"거부 전후 파일이 달라졌습니다.",
			);
			writeFileSync(
				join(evidence, `${name}-sha256.json`),
				JSON.stringify({ before, after: snapshot(target) }, null, 2),
			);
			continue;
		}
		const npm = process.platform === "win32" ? "npm.cmd" : "npm";
		const cli = ["exec", "--yes", "--package=skills@1.7.4", "--", "skills"];
		assert.match(
			run("cli-version", npm, [...cli, "--version"], target).stdout,
			/1\.7\.4/,
		);
		run("cli-help", npm, [...cli, "add", "--help"], target);
		run(
			"cli-selected",
			npm,
			[
				...cli,
				"add",
				root,
				"--agent",
				"codex",
				"--skill",
				"dix-admin-route",
				"--copy",
				"--yes",
			],
			target,
		);
		assert(existsSync(join(target, ".agents/skills/dix-admin-route/SKILL.md")));
		assert(
			!existsSync(join(target, ".agents/skills/dix-admin-setup/SKILL.md")),
		);
		assert(!existsSync(join(target, ".agents/references/spec.md")));
		assert.equal(snapshot(target)["AGENTS.md"], before["AGENTS.md"]);
		run(
			"cli-all",
			npm,
			[
				...cli,
				"add",
				root,
				"--agent",
				"codex",
				"--skill",
				"*",
				"--copy",
				"--yes",
			],
			target,
		);
		for (const skill of skillNameList)
			assert(existsSync(join(target, ".agents/skills", skill, "SKILL.md")));
		for (const path of skillAssetPathList)
			assert(existsSync(join(target, path)), `Skills CLI asset 누락: ${path}`);
		assert(!existsSync(join(target, ".agents/references/spec.md")));
		assert.equal(snapshot(target)["AGENTS.md"], before["AGENTS.md"]);
		install("install-first", target);
		const first = snapshot(target);
		for (const path of skillAssetPathList)
			assert(first[path], `Companion installer asset 누락: ${path}`);
		assert(
			first[".agents/references/dix-admin-design-system.md"],
			"소비 프로젝트에 디자인 시스템 reference가 설치되지 않았습니다.",
		);
		assert.equal(
			first[".agents/references/dix-admin-design-system.md"],
			createHash("sha256")
				.update(readFileSync(join(root, "DESIGN.md")))
				.digest("hex"),
			"소비 프로젝트 디자인 시스템 문서가 root DESIGN.md와 다릅니다.",
		);
		install("install-second", target);
		assert.deepEqual(
			snapshot(target),
			first,
			"두 번째 설치가 byte-identical하지 않습니다.",
		);
		for (const [path, hash] of Object.entries(before)) {
			if (path === "AGENTS.md") {
				const outside = (text) =>
					text.replace(
						/<!-- dix-admin-template:start -->[\s\S]*?<!-- dix-admin-template:end -->/,
						"",
					);
				assert.equal(
					outside(readFileSync(join(target, path), "utf8")),
					outside(
						readFileSync(
							join(root, "fixtures/consumer-agent-kit", name, path),
							"utf8",
						),
					),
				);
			} else assert.equal(first[path], hash, `사용자 파일 변경: ${path}`);
		}
		writeFileSync(
			join(target, ".agents/references/spec.md"),
			"# 이전 설치 버전\n",
		);
		install("update-owned-reference", target);
		assert.deepEqual(
			snapshot(target),
			first,
			"갱신 후 원본 kit와 달라졌습니다.",
		);
		for (const skill of skillNameList) {
			const path = join(target, ".agents/skills", skill, "SKILL.md");
			for (const match of readFileSync(path, "utf8").matchAll(/\]\(([^)]+)\)/g))
				assert(
					existsSync(resolve(dirname(path), match[1].split("#")[0])),
					`Skill reference 누락: ${path}: ${match[1]}`,
				);
		}
		writeFileSync(
			join(evidence, "consumer-sha256.json"),
			JSON.stringify(first, null, 2),
		);
		const manifestPath = join(target, ".agents/references/dix-admin-kit.json");
		const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
		manifest.ownedPathList.push("AGENTS.md");
		writeFileSync(manifestPath, JSON.stringify(manifest));
		const invalidManifestSnapshot = snapshot(target);
		assert.match(
			install("invalid-ownership-manifest", target, [], 1).stderr,
			/ownedPathList가 손상되었습니다/,
		);
		assert.deepEqual(snapshot(target), invalidManifestSnapshot);
		writeFileSync(
			join(evidence, "invalid-ownership-sha256.json"),
			JSON.stringify(invalidManifestSnapshot, null, 2),
		);
		const globalAlias = join(env.HOME, ".agents");
		symlinkSync(target, globalAlias, "dir");
		assert.match(
			install("global-target-symlink", globalAlias, [], 1).stderr,
			/symlink target root는 지원하지 않습니다/,
		);
		assert.deepEqual(snapshot(target), invalidManifestSnapshot);
		unlinkSync(globalAlias);
		const realConsumer = join(temp, "consumer-alias-real");
		cpSync(
			join(root, "fixtures/consumer-agent-kit/consumer-alias"),
			realConsumer,
			{ recursive: true },
		);
		const consumerAlias = join(temp, "consumer-alias");
		symlinkSync(realConsumer, consumerAlias, "dir");
		const realBefore = snapshot(realConsumer);
		const aliasBefore = snapshot(consumerAlias);
		assert.match(
			install("consumer-alias", consumerAlias, [], 1).stderr,
			/symlink target root는 지원하지 않습니다/,
		);
		assert.deepEqual(snapshot(realConsumer), realBefore);
		assert.deepEqual(snapshot(consumerAlias), aliasBefore);
		assert(lstatSync(consumerAlias).isSymbolicLink());
		writeFileSync(
			join(evidence, "consumer-alias-sha256.json"),
			JSON.stringify(
				{
					realBefore,
					realAfter: snapshot(realConsumer),
					aliasBefore,
					aliasAfter: snapshot(consumerAlias),
					aliasPreserved: true,
				},
				null,
				2,
			),
		);
		unlinkSync(consumerAlias);
	}
	for (const path of [
		env.HOME,
		env.XDG_CONFIG_HOME,
		env.XDG_DATA_HOME,
		env.CODEX_HOME,
	])
		assert.deepEqual(
			snapshot(path),
			{},
			`격리한 global directory가 변경되었습니다: ${path}`,
		);
	for (const path of [
		join(env.HOME, ".agents/skills"),
		join(env.HOME, ".codex/skills"),
		join(env.XDG_CONFIG_HOME, "agents/skills"),
		join(env.CODEX_HOME, "skills"),
	])
		assert.deepEqual(snapshot(path), {}, `global Skill 생성: ${path}`);
	writeFileSync(
		join(evidence, "report.json"),
		JSON.stringify(
			{
				passed: true,
				cliVersion: "1.7.4",
				temp,
				evidence,
				resultList,
				home: snapshot(env.HOME),
				config: snapshot(env.XDG_CONFIG_HOME),
				codex: snapshot(env.CODEX_HOME),
			},
			null,
			2,
		),
	);
	if (evidence === temp || evidence.startsWith(temp + "/"))
		throw new Error("증거 경로는 verifier temporary root 바깥에 지정하세요.");
	rmSync(temp, { recursive: true });
	assert(!existsSync(temp));
	writeFileSync(
		join(evidence, "cleanup.json"),
		JSON.stringify(
			{
				removed: temp,
				exists: existsSync(temp),
				evidencePreserved: existsSync(join(evidence, "report.json")),
			},
			null,
			2,
		),
	);
	writeFileSync(
		join(evidence, "artifact-sha256.json"),
		JSON.stringify(snapshot(evidence), null, 2),
	);
	console.log(`Agent Kit 검증 통과: ${evidence}/report.json`);
} catch (error) {
	writeFileSync(
		join(evidence, "failure.json"),
		JSON.stringify({ error: error.message, resultList, temp }, null, 2),
	);
	console.error(`${error.message}\n증거: ${evidence}`);
	process.exitCode = 1;
}
