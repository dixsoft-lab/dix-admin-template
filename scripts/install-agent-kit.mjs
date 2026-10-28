import {
	existsSync,
	lstatSync,
	readFileSync,
	realpathSync,
	mkdirSync,
	writeFileSync,
} from "node:fs";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

export const skillNameList = [
	"setup",
	"route",
	"ui",
	"feature",
	"data",
	"verify",
].map((name) => `dix-admin-${name}`);
const referenceNameList = [
	"frontend-architecture.md",
	"spec.md",
	"consumer-guide.md",
	"agent-kit-installation.md",
];
const start = "<!-- dix-admin-template:start -->";
const end = "<!-- dix-admin-template:end -->";
const source = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const installAgentKit = (argumentList) => {
	if (
		argumentList.some((value) => value === "-g" || value.startsWith("--global"))
	)
		throw new Error(
			"전역 설치는 지원하지 않습니다. --target <프로젝트 경로>를 사용하세요.",
		);
	if (argumentList.length !== 2 || argumentList[0] !== "--target")
		throw new Error(
			"사용법: node scripts/install-agent-kit.mjs --target <기존 프로젝트 경로>",
		);
	const requestedTarget = resolve(argumentList[1]);
	if (lstatSync(requestedTarget).isSymbolicLink())
		throw new Error(
			"symlink target root는 지원하지 않습니다. 실제 프로젝트 경로를 지정하세요.",
		);
	const target = realpathSync(requestedTarget);
	const userHome = realpathSync(homedir());
	const globalRootList = [
		resolve(userHome, ".agents"),
		resolve(userHome, ".codex"),
		resolve(userHome, ".config/agents"),
		resolve(homedir(), ".agents"),
		resolve(homedir(), ".codex"),
		resolve(homedir(), ".config/agents"),
	];
	if (process.env.CODEX_HOME)
		globalRootList.push(resolve(process.env.CODEX_HOME));
	if (process.env.XDG_CONFIG_HOME)
		globalRootList.push(resolve(process.env.XDG_CONFIG_HOME, "agents"));
	for (const path of [...globalRootList])
		if (existsSync(path)) globalRootList.push(realpathSync(path));
	if (
		target === userHome ||
		target === sep ||
		target === realpathSync(source) ||
		globalRootList.some((path) =>
			[target, requestedTarget].some(
				(candidate) => candidate === path || candidate.startsWith(path + sep),
			),
		)
	)
		throw new Error(
			"사용자 home·filesystem root·원본 저장소는 target으로 사용할 수 없습니다.",
		);
	if (
		!existsSync(resolve(target, "package.json")) &&
		!existsSync(resolve(target, ".git"))
	)
		throw new Error(
			"target에는 package.json 또는 .git이 있어야 합니다. 프로젝트 root를 지정하세요.",
		);
	const assertSafePath = (path) => {
		const segmentList = relative(target, path).split(sep);
		let current = target;
		for (const segment of segmentList) {
			current = resolve(current, segment);
			if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink())
				throw new Error(`symlink 대상에는 쓰지 않습니다: ${current}`);
		}
	};
	const agentsPath = resolve(target, "AGENTS.md");
	assertSafePath(agentsPath);
	const previous = existsSync(agentsPath)
		? readFileSync(agentsPath, "utf8")
		: "";
	const startCount = previous.split(start).length - 1;
	const endCount = previous.split(end).length - 1;
	if (
		startCount !== endCount ||
		startCount > 1 ||
		(startCount === 1 && previous.indexOf(start) > previous.indexOf(end))
	)
		throw new Error(
			"AGENTS.md managed marker가 손상되었습니다. start/end 한 쌍을 복구한 뒤 다시 실행하세요. 변경하지 않았습니다.",
		);
	const block = `${start}\n## Dix Admin 작업 routing\n\n${skillNameList.map((name) => `- ${name.replace("dix-admin-", "")}: [.agents/skills/${name}/SKILL.md](.agents/skills/${name}/SKILL.md)`).join("\n")}\n\n작업 전에 [아키텍처](.agents/references/frontend-architecture.md), [도구 명세](.agents/references/spec.md), [소비 안내](.agents/references/consumer-guide.md)를 읽습니다. 기존 프로젝트 지침과 충돌하면 변경 전에 충돌을 보고합니다.\n${end}`;
	let next;
	if (startCount === 1)
		next =
			previous.slice(0, previous.indexOf(start)) +
			block +
			previous.slice(previous.indexOf(end) + end.length);
	else {
		const separator = previous.endsWith("\n") || !previous ? "" : "\n";
		next = previous + separator + "\n" + block + "\n";
	}
	const ownedPathList = [
		...skillNameList.map((name) => `.agents/skills/${name}/SKILL.md`),
		...referenceNameList.map((name) => `.agents/references/${name}`),
	];
	const manifestPath = resolve(target, ".agents/references/dix-admin-kit.json");
	assertSafePath(manifestPath);
	const formerPathList = existsSync(manifestPath)
		? JSON.parse(readFileSync(manifestPath, "utf8")).ownedPathList
		: [];
	if (
		!Array.isArray(formerPathList) ||
		formerPathList.some((path) => !ownedPathList.includes(path)) ||
		new Set(formerPathList).size !== formerPathList.length
	)
		throw new Error("dix-admin-kit.json의 ownedPathList가 손상되었습니다.");
	const writeList = ownedPathList.map((path) => {
		const destination = resolve(target, path);
		assertSafePath(destination);
		const content = readFileSync(resolve(source, path));
		if (
			existsSync(destination) &&
			!formerPathList.includes(path) &&
			!readFileSync(destination).equals(content)
		)
			throw new Error(
				`소유권이 없는 기존 파일을 덮어쓰지 않습니다: ${path}. 파일을 검토하고 별도 보존한 뒤 다시 실행하세요.`,
			);
		return [destination, content];
	});
	writeList.push(
		[agentsPath, next],
		[
			manifestPath,
			JSON.stringify({ version: 1, ownedPathList }, null, 2) + "\n",
		],
	);
	let changed = 0;
	for (const [path, content] of writeList) {
		const buffer = Buffer.from(content);
		if (existsSync(path) && readFileSync(path).equals(buffer)) continue;
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, buffer);
		changed++;
	}
	console.log(
		JSON.stringify({ target, changed, skillCount: skillNameList.length }),
	);
};

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	try {
		installAgentKit(process.argv.slice(2));
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
