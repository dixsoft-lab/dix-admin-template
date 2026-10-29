import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const optionList = process.argv.slice(2);
const fixture = optionList[0];
const allowedFixture = "--fixture=unknown-capability-allowed";

if (
	optionList.length > 1 ||
	(fixture !== undefined && fixture !== allowedFixture)
) {
	console.error("지원하지 않는 옵션입니다:", optionList.join(" "));
	process.exit(1);
}

const forbiddenPattern =
	/\bfirebase\b|@mi-user-story\/|\bmiuserstory\b|MI User\s*Story|["']l[12]["']/i;
const sourceExtensionSet = new Set([".ts", ".tsx", ".css"]);
const failureList = [];

const inspectDirectory = async (directory) => {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await inspectDirectory(path);
			continue;
		}
		if (!sourceExtensionSet.has(extname(path))) continue;
		const source = await readFile(path, "utf8");
		const match = forbiddenPattern.exec(source);
		if (!match) continue;
		const line = source.slice(0, match.index).split("\n").length;
		failureList.push(
			`${relative(root, path)}:${line}: consumer contract에 제품 의존성이 남아 있습니다 (${match[0]}).`,
		);
	}
};

await inspectDirectory(join(root, "src"));

const permissionPath = join(
	root,
	"src/contract/authorization/permission-adapter.ts",
);
let permissionSource = await readFile(permissionPath, "utf8");
if (fixture === allowedFixture) {
	const guard =
		"if (!permission.capabilityList.includes(capability)) return false;";
	if (!permissionSource.includes(guard)) {
		console.error(
			"negative fixture가 변경할 capability guard를 찾을 수 없습니다.",
		);
		process.exit(1);
	}
	permissionSource = permissionSource.replace(guard, "");
}

const compiled = ts.transpileModule(permissionSource, {
	compilerOptions: {
		module: ts.ModuleKind.ESNext,
		target: ts.ScriptTarget.ES2022,
	},
});
const permissionModule = await import(
	`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString("base64")}`
);
let callCount = 0;
const permission = {
	capabilityList: ["read-entry"],
	allows: () => {
		callCount += 1;
		return true;
	},
};
const unknownResult = permissionModule.canAccessCapability(
	permission,
	"unknown",
);
if (unknownResult !== false || callCount !== 0) {
	failureList.push(
		"src/contract/authorization/permission-adapter.ts: 알 수 없는 capability는 consumer 판정 전에 거부해야 합니다.",
	);
}
if (permissionModule.canAccessCapability(permission, "read-entry") !== true) {
	failureList.push(
		"src/contract/authorization/permission-adapter.ts: 선언되고 허용된 capability를 거부했습니다.",
	);
}
if (
	permissionModule.canAccessCapability(
		{ capabilityList: ["read-entry"], allows: () => false },
		"read-entry",
	) !== false
) {
	failureList.push(
		"src/contract/authorization/permission-adapter.ts: consumer가 거부한 capability를 허용했습니다.",
	);
}

if (failureList.length > 0) {
	for (const failure of failureList) console.error(failure);
	process.exit(1);
}
console.log(
	"consumer contract 검증 통과: 제품 의존성 없음, capability 기본 거부·명시적 허용·거부 확인.",
);
