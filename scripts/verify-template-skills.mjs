import { readFile, realpath, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parsers } from "prettier/plugins/yaml";

const root = await realpath(fileURLToPath(new URL("..", import.meta.url)));
const fixtureList = [
	"malformed-skill",
	"invalid-version",
	"missing-reference",
	"kp-specific-policy",
	"unknown-command",
	"reordered-frontmatter",
	"invalid-yaml",
	"duplicate-metadata",
	"invalid-metadata",
];
const argumentList = process.argv.slice(2);
const fixture = argumentList[0]?.replace("--fixture=", "");
if (
	argumentList.length > 1 ||
	(argumentList.length === 1 && !argumentList[0].startsWith("--fixture=")) ||
	(fixture && !fixtureList.includes(fixture))
) {
	console.error(`지원하는 fixture: ${fixtureList.join(", ")}`);
	process.exit(1);
}

const skillSuffixList = ["setup", "route", "ui", "feature", "data", "verify"];
const sectionList = ["적용 시점", "참조", "작업 순서", "검증", "경계", "증거"];
const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const agentGuide = await readFile(join(root, "AGENTS.md"), "utf8");
const failureList = [];
const receiptList = [];
// YAML 문법은 기존 Prettier parser로 읽는다. 필수 계약은 단일 mapping의 name·description
// 문자열과 metadata mapping의 MAJOR.MINOR.PATCH version이다. key 순서·따옴표·
// block scalar·flow mapping은 허용하며 중복 key와 alias로 대체한 필수 값은 거부한다.
const frontmatterPattern = /^---\n([\s\S]*?)\n---(?:\n|$)/;
const scalarTypeSet = new Set([
	"plain",
	"quoteSingle",
	"quoteDouble",
	"blockFolded",
	"blockLiteral",
]);
const readScalar = (node) =>
	node && scalarTypeSet.has(node.type) ? node.value : undefined;
const readMapping = (node, report, field) => {
	if (!node || !["mapping", "flowMapping"].includes(node.type)) {
		report("frontmatter", field + "는 YAML mapping이어야 합니다.");
		return new Map();
	}
	const valueMap = new Map();
	for (const item of node.children) {
		const key = readScalar(item.children?.[0]?.children?.[0]);
		if (typeof key !== "string") {
			report(
				"frontmatter",
				field + "의 key는 직접 선언한 문자열이어야 합니다.",
			);
			continue;
		}
		if (valueMap.has(key))
			report("frontmatter", field + "에 중복 key " + key + "가 있습니다.");
		valueMap.set(key, item.children?.[1]?.children?.[0]);
	}
	return valueMap;
};
const parseMetadata = (source, report) => {
	const frontmatter = frontmatterPattern.exec(source);
	if (!frontmatter) {
		report("frontmatter", "문서 시작의 YAML frontmatter 구분자가 없습니다.");
		return {};
	}
	let tree;
	try {
		tree = parsers.yaml.parse(frontmatter[1], {});
	} catch (error) {
		report("frontmatter", "YAML parse 실패: " + error.message);
		return {};
	}
	if (tree.children.length !== 1) {
		report("frontmatter", "YAML document는 하나여야 합니다.");
		return {};
	}
	const body = tree.children[0].children.find(
		(node) => node.type === "documentBody",
	);
	const valueMap = readMapping(body?.children[0], report, "frontmatter");
	const metadataMap = readMapping(valueMap.get("metadata"), report, "metadata");
	return {
		name: readScalar(valueMap.get("name")),
		description: readScalar(valueMap.get("description")),
		version: readScalar(metadataMap.get("version")),
	};
};
const forbiddenPolicy =
	/kingdompla-net|kp-church|miuserstory|cloudfunctions\.net|firebase\s+(?:deploy|hosting:channel:deploy)|(?:^|\/)\.config\/(?:opencode|Claude)/i;
const contained = (path) => {
	const offset = relative(root, path);
	return offset !== ".." && !offset.startsWith("../") && !isAbsolute(offset);
};

for (const suffix of skillSuffixList) {
	const name = `dix-admin-${suffix}`;
	const path = `.agents/skills/${name}/SKILL.md`;
	let source;
	try {
		source = (await readFile(join(root, path), "utf8")).replaceAll(
			"\r\n",
			"\n",
		);
	} catch {
		failureList.push(`${path}:1: [파일] Skill이 없습니다.`);
		continue;
	}
	if (fixture === "malformed-skill" && suffix === "route")
		source = source.replace("## 작업 순서", "## 변경 순서");
	if (fixture === "invalid-version" && suffix === "setup")
		source = source.replace('version: "1.0.0"', 'version: "latest"');
	if (fixture === "missing-reference" && suffix === "setup")
		source = source.replace(
			"../../references/consumer-guide.md",
			"../../references/missing-consumer-guide.md",
		);
	if (fixture === "kp-specific-policy" && suffix === "data")
		source += "\n배포는 `firebase deploy --project miuserstory`로 수행한다.\n";
	if (fixture === "unknown-command" && suffix === "verify")
		source += "\n`npm run verify:missing-contract`\n";
	if (fixture === "reordered-frontmatter" && suffix === "setup")
		source = source.replace(
			frontmatterPattern,
			"---\nmetadata: { version: '1.0.0' }\ndescription: >-\n  Admin 설치와 consumer 연결을\n  수행할 때 사용한다.\nname: \"dix-admin-setup\"\n---\n",
		);
	if (fixture === "invalid-yaml" && suffix === "setup")
		source = source.replace('version: "1.0.0"', 'version: ["1.0.0"');
	if (fixture === "duplicate-metadata" && suffix === "setup")
		source = source.replace(
			'version: "1.0.0"',
			'version: "1.0.0"\n  version: "2.0.0"',
		);
	if (fixture === "invalid-metadata" && suffix === "setup")
		source = source.replace('metadata:\n  version: "1.0.0"', "metadata: []");
	const report = (section, message, position = 0) => {
		const line = source.slice(0, position).split("\n").length;
		failureList.push(`${path}:${line}: [${section}] ${message}`);
	};
	const metadata = parseMetadata(source, report);
	if (metadata.name !== name)
		report("frontmatter/name", "폴더 이름 " + name + "과 name이 다릅니다.");
	if (
		typeof metadata.description !== "string" ||
		!metadata.description.trim() ||
		!/[가-힣]/u.test(metadata.description)
	)
		report(
			"frontmatter/description",
			"사용 시점을 설명하는 한국어 문자열 description이 필요합니다.",
		);
	if (
		typeof metadata.version !== "string" ||
		!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(metadata.version)
	)
		report(
			"frontmatter/version",
			"metadata.version은 MAJOR.MINOR.PATCH 형태의 SemVer 문자열이어야 합니다.",
		);
	const sectionMap = new Map();
	for (const match of source.matchAll(
		/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm,
	)) {
		if (sectionMap.has(match[1]))
			report(match[1], "중복 절입니다.", match.index);
		sectionMap.set(match[1], match[2].trim());
	}
	for (const section of sectionList)
		if (!sectionMap.get(section))
			report(section, "필수 절이 없거나 비어 있습니다.");
	if ((sectionMap.get("작업 순서")?.match(/^\d+\. /gm)?.length ?? 0) < 3)
		report("작업 순서", "구체적인 순서가 있는 workflow가 필요합니다.");
	const forbidden = forbiddenPolicy.exec(source);
	if (forbidden)
		report(
			"경계",
			`제품 전용 API·hosting·credential 정책을 가져올 수 없습니다: ${forbidden[0]}`,
			forbidden.index,
		);
	let referenceCount = 0;
	let referenceFileCount = 0;
	for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
		const href = match[1].split("#")[0];
		if (!href || /^[a-z]+:/i.test(href)) {
			report(
				"참조",
				`프로젝트 로컬 문서 링크가 필요합니다: ${match[1]}`,
				match.index,
			);
			continue;
		}
		let target;
		try {
			target = resolve(dirname(join(root, path)), decodeURIComponent(href));
		} catch {
			report("참조", `잘못된 URL encoding ${href}`, match.index);
			continue;
		}
		if (
			!contained(target) ||
			!existsSync(target) ||
			!contained(await realpath(target)) ||
			!(await stat(target)).isFile()
		) {
			report("참조", `해결할 수 없는 프로젝트 로컬 링크 ${href}`, match.index);
			continue;
		}
		referenceCount += 1;
		if (relative(root, target).startsWith(".agents/references/"))
			referenceFileCount += 1;
	}
	if (referenceFileCount < 2)
		report(
			"참조",
			"실제 architecture·spec·consumer reference 중 두 개 이상을 연결하세요.",
		);
	let commandCount = 0;
	for (const match of source.matchAll(/\bnpm run ([a-zA-Z0-9:_-]+)/g)) {
		commandCount += 1;
		if (!(match[1] in manifest.scripts))
			report(
				"검증 명령",
				`package.json에 없는 npm script ${match[1]}`,
				match.index,
			);
	}
	for (const match of source.matchAll(
		/\bnode (scripts\/[a-zA-Z0-9_/-]+\.mjs)/g,
	)) {
		commandCount += 1;
		if (!existsSync(join(root, match[1])))
			report("검증 명령", `실행 script가 없습니다: ${match[1]}`, match.index);
	}
	if (commandCount === 0)
		report("검증 명령", "현재 저장소에서 실행할 검증 명령이 필요합니다.");
	if (!agentGuide.includes(path))
		report("routing", "root AGENTS.md의 작업 routing에 Skill 경로가 없습니다.");
	receiptList.push({
		name,
		version: metadata.version,
		referenceCount,
		commandCount,
	});
}

if (failureList.length) {
	console.error(failureList.join("\n"));
	process.exit(1);
}
console.log(
	`PASS: Skill ${receiptList.length}개 YAML metadata/version·필수 절·workflow·참조·명령·AGENTS routing`,
);
for (const receipt of receiptList)
	console.log(
		`${receipt.name}@${receipt.version}: 참조 ${receipt.referenceCount}개, 명령 ${receipt.commandCount}개`,
	);
