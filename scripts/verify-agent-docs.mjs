import { access, readFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argumentList = process.argv.slice(2);
const fixtureList = [
	"missing-route-reference",
	"stale-toolchain-version",
	"invalid-mermaid-edge",
	"duplicate-mermaid-edge",
	"reorganized-mermaid",
];
const fixture = argumentList[0]?.replace("--fixture=", "");
if (
	argumentList.length > 1 ||
	(argumentList.length === 1 && !argumentList[0].startsWith("--fixture=")) ||
	(fixture && !fixtureList.includes(fixture))
) {
	console.error(`지원하는 fixture: ${fixtureList.join(", ")}`);
	process.exit(1);
}

const docPathList = [
	"README.md",
	"DESIGN.md",
	"AGENTS.md",
	".agents/references/frontend-architecture.md",
	".agents/references/spec.md",
];
const documentMap = new Map(
	await Promise.all(
		docPathList.map(async (path) => [
			path,
			await readFile(resolve(root, path), "utf8"),
		]),
	),
);
const manifest = JSON.parse(
	await readFile(resolve(root, "package.json"), "utf8"),
);
const lock = JSON.parse(
	await readFile(resolve(root, "package-lock.json"), "utf8"),
);
const architecturePath = ".agents/references/frontend-architecture.md";
const specPath = ".agents/references/spec.md";
const changeDiagram = (change) => {
	documentMap.set(
		"README.md",
		documentMap
			.get("README.md")
			.replace(
				/(```mermaid\s*\n)([\s\S]*?)(```)/,
				(_match, start, diagram, end) => start + change(diagram) + end,
			),
	);
};
if (fixture === "duplicate-mermaid-edge")
	changeDiagram((diagram) => diagram + "Standalone --> Consumer\n");
if (fixture === "reorganized-mermaid")
	changeDiagram((diagram) => {
		const lineList = diagram
			.split("\n")
			.map((line) => line.trim())
			.filter(Boolean);
		const identifierMap = new Map();
		for (const line of lineList) {
			const node = /^([A-Za-z][A-Za-z0-9]*)\[/.exec(line);
			if (node) identifierMap.set(node[1], `Part${identifierMap.size + 1}`);
		}
		const contentList = lineList
			.slice(1)
			.map((line) =>
				line
					.replace(/^([A-Za-z][A-Za-z0-9]*)(?=\[)/, (id) =>
						identifierMap.get(id),
					)
					.replace(
						/^([A-Za-z][A-Za-z0-9]*) --> ([A-Za-z][A-Za-z0-9]*)$/,
						(_match, from, to) =>
							`${identifierMap.get(from)} --> ${identifierMap.get(to)}`,
					),
			);
		return `flowchart LR\n${contentList.reverse().join("\n")}\n`;
	});
if (fixture === "invalid-mermaid-edge")
	documentMap.set(
		"README.md",
		documentMap
			.get("README.md")
			.replace("Standalone --> Consumer", "Standalone --> Missing"),
	);
if (fixture === "missing-route-reference")
	documentMap.set(
		architecturePath,
		documentMap
			.get(architecturePath)
			.replaceAll("src/route/route-paths.ts", "removed-route-source.ts"),
	);
if (fixture === "stale-toolchain-version") {
	const source = documentMap.get(specPath);
	const row = new RegExp(
		"(\\|\\s*`react`\\s*\\|\\s*`[^`]+`\\s*\\|\\s*)`[^`]+`",
	);
	const changed = source.replace(row, "$1`0.0.0-stale`");
	if (source === changed)
		throw new Error("stale fixture의 React 행을 찾지 못했습니다.");
	documentMap.set(specPath, changed);
}

const failureList = [];
const lineAt = (source, index) =>
	source.slice(0, Math.max(index, 0)).split("\n").length;
const fail = (path, message, needle = "") => {
	const source = documentMap.get(path) ?? "";
	failureList.push(
		`${path}:${lineAt(source, source.indexOf(needle))}: ${message}`,
	);
};
const requireText = (path, value, description = value) => {
	if (!documentMap.get(path)?.includes(value))
		fail(path, `필수 ${description} 참조가 없습니다.`, value);
};
const headingSlug = (heading) =>
	heading
		.toLowerCase()
		.replace(/[`*_]/g, "")
		.replace(/[^\p{L}\p{N}_ -]/gu, "")
		.trim()
		.replaceAll(" ", "-");

let linkCount = 0;
for (const [path, source] of documentMap) {
	for (const match of source.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)) {
		const target = match[1];
		if (/^(?:https?:|mailto:)/.test(target)) continue;
		const [linkPath, fragment] = target.split("#");
		const absolute = linkPath
			? resolve(root, dirname(path), decodeURIComponent(linkPath))
			: resolve(root, path);
		if (isAbsolute(linkPath) || relative(root, absolute).startsWith("..")) {
			fail(path, `repository 밖의 문서 경로 ${target}`, match[0]);
			continue;
		}
		try {
			await access(absolute);
			if (fragment && absolute.endsWith(".md")) {
				const referenced =
					documentMap.get(relative(root, absolute)) ??
					(await readFile(absolute, "utf8"));
				const headingSet = new Set(
					[...referenced.matchAll(/^#{1,6}\s+(.+)$/gm)].map((entry) =>
						headingSlug(entry[1]),
					),
				);
				if (!headingSet.has(decodeURIComponent(fragment)))
					fail(path, `문서 heading이 없습니다: ${target}`, match[0]);
			}
			linkCount += 1;
		} catch {
			fail(path, `문서 링크 대상이 없습니다: ${target}`, match[0]);
		}
	}
}

for (const routePath of [
	"src/route/route-paths.ts",
	"src/app/route/router.tsx",
])
	requireText(architecturePath, routePath, `route source ${routePath}`);
for (const contract of [
	"createRouteList",
	"createRouter",
	"generatePath",
	"basename",
	"AuthAdapter",
	"PermissionAdapter",
	"DesignSystemProvider",
	"Query/Mutation",
])
	requireText(architecturePath, contract, `architecture contract ${contract}`);

const skillNameList = ["setup", "route", "ui", "feature", "data", "verify"];
for (const name of skillNameList) {
	const path = `.agents/skills/dix-admin-${name}/SKILL.md`;
	requireText("AGENTS.md", path, `작업 routing ${path}`);
	try {
		await access(resolve(root, path));
	} catch {
		fail("AGENTS.md", `작업 routing의 Skill 파일이 없습니다: ${path}`, path);
	}
}
for (const reference of [
	".agents/references/frontend-architecture.md",
	".agents/references/spec.md",
	".agents/references/consumer-guide.md",
])
	requireText("AGENTS.md", reference, `reference routing ${reference}`);

const mermaidBlockList = [
	...documentMap.get("README.md").matchAll(/```mermaid\s*\n([\s\S]*?)```/g),
];
const nodeMap = new Map();
const edgeSet = new Set();
if (mermaidBlockList.length !== 1)
	fail(
		"README.md",
		"아키텍처 Mermaid flowchart는 하나여야 합니다.",
		"```mermaid",
	);
else {
	const lineList = mermaidBlockList[0][1]
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("%%"));
	if (!/^flowchart (?:TB|TD|BT|LR|RL)$/.test(lineList.shift() ?? ""))
		fail(
			"README.md",
			"Mermaid 시작에 flowchart와 방향(TB/TD/BT/LR/RL)을 선언하세요.",
			"```mermaid",
		);
	for (const line of lineList) {
		const node = /^([A-Za-z][A-Za-z0-9]*)\["([^"\n]+)"\]$/.exec(line);
		const edge = /^([A-Za-z][A-Za-z0-9]*) --> ([A-Za-z][A-Za-z0-9]*)$/.exec(
			line,
		);
		if (node) {
			if (nodeMap.has(node[1]))
				fail("README.md", `Mermaid node 중복: ${node[1]}`, line);
			nodeMap.set(node[1], node[2]);
		} else if (edge) {
			const key = `${edge[1]}-->${edge[2]}`;
			if (edgeSet.has(key))
				fail("README.md", `Mermaid edge 중복: ${key}`, line);
			edgeSet.add(key);
		} else {
			fail(
				"README.md",
				`지원하는 Mermaid flowchart 문법이 아닙니다: ${line}`,
				line,
			);
		}
	}
	for (const edge of edgeSet)
		for (const id of edge.split("-->"))
			if (!nodeMap.has(id))
				fail("README.md", `Mermaid edge의 node가 없습니다: ${id}`, edge);
}
if (nodeMap.size < 3 || edgeSet.size < 2)
	fail(
		"README.md",
		"Mermaid는 최소 3개 책임 node와 2개 연결로 구조를 설명해야 합니다.",
		"```mermaid",
	);
const neighborMap = new Map([...nodeMap.keys()].map((id) => [id, new Set()]));
for (const edge of edgeSet) {
	const [from, to] = edge.split("-->");
	if (neighborMap.has(from) && neighborMap.has(to)) {
		neighborMap.get(from).add(to);
		neighborMap.get(to).add(from);
	}
}
const visitedNode = new Set();
const pendingNode = nodeMap.size ? [nodeMap.keys().next().value] : [];
while (pendingNode.length) {
	const id = pendingNode.pop();
	if (visitedNode.has(id)) continue;
	visitedNode.add(id);
	pendingNode.push(...neighborMap.get(id));
}
const disconnectedNode = [...nodeMap.keys()].filter(
	(id) => !visitedNode.has(id),
);
if (disconnectedNode.length)
	fail(
		"README.md",
		`Mermaid에서 연결되지 않은 책임이 있습니다: ${disconnectedNode.join(", ")}. 관련 node와 연결하세요.`,
		"```mermaid",
	);

const readTable = (name) => {
	const source = documentMap.get(specPath);
	const start = `<!-- ${name}:start -->`;
	const end = `<!-- ${name}:end -->`;
	const beginIndex = source.indexOf(start);
	const endIndex = source.indexOf(end);
	if (beginIndex < 0 || endIndex <= beginIndex) {
		fail(specPath, `${name} 경계가 없습니다.`, start);
		return new Map();
	}
	const rowMap = new Map();
	for (const line of source.slice(beginIndex, endIndex).split("\n")) {
		const cell = line
			.split("|")
			.slice(1, -1)
			.map((value) => value.trim());
		if (!cell[0]?.startsWith("`")) continue;
		const value = cell.map((entry) => entry.replace(/^`|`$/g, ""));
		if (rowMap.has(value[0]))
			fail(specPath, `${name} 중복 행 ${value[0]}`, line);
		rowMap.set(value[0], value.slice(1));
	}
	return rowMap;
};
const dependencyTable = readTable("dependency-table");
const dependencyMap = { ...manifest.dependencies, ...manifest.devDependencies };
for (const [name, range] of Object.entries(dependencyMap)) {
	const resolvedVersion = lock.packages?.[`node_modules/${name}`]?.version;
	const row = dependencyTable.get(name);
	if (!row || row[0] !== range || row[1] !== resolvedVersion)
		fail(
			specPath,
			`toolchain 불일치 ${name}: manifest ${range}, lock ${resolvedVersion}; 표를 갱신하세요.`,
			name,
		);
}
for (const name of dependencyTable.keys())
	if (!(name in dependencyMap))
		fail(specPath, `manifest에 없는 dependency 행 ${name}`, name);
for (const [name, range] of Object.entries(manifest.engines ?? {})) {
	const hasEngineRow = documentMap
		.get(specPath)
		.split("\n")
		.some((line) => {
			const cell = line
				.split("|")
				.slice(1, -1)
				.map((value) => value.trim().replace(/^`|`$/g, ""));
			return cell[0] === name && cell[1] === range;
		});
	if (!hasEngineRow)
		fail(specPath, `runtime engine 불일치 ${name}: ${range}`, name);
}
if (
	!documentMap
		.get(specPath)
		.includes(`lockfileVersion: ${lock.lockfileVersion}`)
)
	fail(specPath, `lockfileVersion ${lock.lockfileVersion}을 기록하세요.`);
const scriptTable = readTable("script-table");
for (const [name, command] of Object.entries(manifest.scripts ?? {}))
	if (scriptTable.get(name)?.[0] !== command)
		fail(
			specPath,
			`script 불일치 ${name}: package.json의 ${command}를 기록하세요.`,
			name,
		);
for (const name of scriptTable.keys())
	if (!(name in (manifest.scripts ?? {})))
		fail(specPath, `package.json에 없는 script 행 ${name}`, name);

if (failureList.length) {
	console.error(failureList.join("\n"));
	process.exit(1);
}
console.log(
	`PASS: 문서 ${documentMap.size}개·내부 링크 ${linkCount}개·Skill routing ${skillNameList.length}개·dependency ${dependencyTable.size}개·script ${scriptTable.size}개`,
);
console.log(
	`PASS: Mermaid flowchart 제한 문법 parser — node ${nodeMap.size}개·edge ${edgeSet.size}개; 브라우저 rendering 검증은 포함하지 않음`,
);
