import {
	existsSync,
	lstatSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argumentList = process.argv.slice(2);
const dryRun = argumentList.length === 1 && argumentList[0] === "--dry-run";
if (argumentList.length > 0 && !dryRun) {
	console.error("사용법: npm run remove:demo [-- --dry-run]");
	process.exit(1);
}

const demoDirectoryList = ["src/app/demo", "src/page/demo"];
const appPath = "src/app/App.tsx";
const appTestPath = "src/app/App.test.tsx";
const markerNameList = ["loader", "render"];
const safeResolve = (relativePath) => {
	const path = resolve(root, relativePath);
	const offset = relative(root, path);
	if (offset === ".." || offset.startsWith(`..${sep}`) || isAbsolute(offset))
		throw new Error(`저장소 밖의 경로는 변경할 수 없습니다: ${relativePath}`);
	return path;
};

const appFilePath = safeResolve(appPath);
if (!existsSync(appFilePath)) throw new Error(`${appPath} 파일이 없습니다.`);
let appSource = readFileSync(appFilePath, "utf8");
const hasDemoDirectory = demoDirectoryList.some((path) =>
	existsSync(safeResolve(path)),
);
const hasDemoMarker = markerNameList.some((name) =>
	appSource.includes(`// template-demo:${name}:start`),
);
if (
	hasDemoMarker &&
	markerNameList.some(
		(name) =>
			!appSource.includes(`// template-demo:${name}:start`) ||
			!appSource.includes(`// template-demo:${name}:end`),
	)
)
	throw new Error(
		`${appPath}의 Demo 표식 일부가 누락되어 제거를 중단했습니다.`,
	);

const stripMarkedBlock = (source, name) => {
	const startMarker = `// template-demo:${name}:start`;
	const endMarker = `// template-demo:${name}:end`;
	const startIndex = source.indexOf(startMarker);
	const endIndex = source.indexOf(endMarker);
	if (startIndex === -1 && endIndex === -1) return source;
	if (
		startIndex === -1 ||
		endIndex === -1 ||
		source.indexOf(startMarker, startIndex + startMarker.length) !== -1 ||
		source.indexOf(endMarker, endIndex + endMarker.length) !== -1 ||
		endIndex < startIndex
	)
		throw new Error(
			`${appPath}의 ${name} 표식이 손상되어 Demo를 제거하지 않았습니다.`,
		);
	const blockStart = source.lastIndexOf("\n", startIndex) + 1;
	const endOfMarkerLine = source.indexOf("\n", endIndex);
	const blockEnd = endOfMarkerLine === -1 ? source.length : endOfMarkerLine + 1;
	return source.slice(0, blockStart) + source.slice(blockEnd);
};

if (hasDemoMarker) {
	for (const name of markerNameList)
		appSource = stripMarkedBlock(appSource, name);
	const demoImport =
		'import { type ComponentType, lazy, Suspense } from "react";';
	if (!appSource.includes(demoImport))
		throw new Error(
			`${appPath}의 React import가 예상한 형식과 달라 제거를 중단했습니다.`,
		);
	appSource = appSource.replace(
		demoImport,
		'import type { ComponentType } from "react";',
	);
} else if (hasDemoDirectory) {
	throw new Error(
		`${appPath}의 Demo 표식을 찾지 못했습니다. 기존 변경을 확인한 뒤 수동으로 연결을 해제하세요.`,
	);
}

const appTestFilePath = safeResolve(appTestPath);
const removeAppTest =
	existsSync(appTestFilePath) &&
	/DemoApp|@\/app\/demo\//.test(readFileSync(appTestFilePath, "utf8"));

const markdownPathList = [];
const collectMarkdown = (directory, relativeDirectory = "") => {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (
			entry.isDirectory() &&
			[".git", "node_modules", "dist", ".vite", ".omo"].includes(entry.name)
		)
			continue;
		const relativePath = relativeDirectory
			? `${relativeDirectory}/${entry.name}`
			: entry.name;
		const absolutePath = resolve(directory, entry.name);
		if (entry.isDirectory()) collectMarkdown(absolutePath, relativePath);
		else if (entry.isFile() && entry.name.endsWith(".md"))
			markdownPathList.push(relativePath);
	}
};
collectMarkdown(root);

const isDemoTarget = (documentPath, target) => {
	if (/^(?:https?:|mailto:|#)/.test(target)) return false;
	const targetPath = decodeURIComponent(target.split(/[?#]/, 1)[0]);
	if (!targetPath) return false;
	const absolutePath = resolve(root, dirname(documentPath), targetPath);
	const offset = relative(root, absolutePath);
	if (offset === ".." || offset.startsWith(`..${sep}`)) return false;
	return demoDirectoryList.some(
		(directory) =>
			offset === directory || offset.startsWith(`${directory}${sep}`),
	);
};

const markdownChangeList = [];
for (const path of markdownPathList) {
	const absolutePath = safeResolve(path);
	const fileStat = lstatSync(absolutePath);
	if (fileStat.isSymbolicLink()) continue;
	const source = readFileSync(absolutePath, "utf8");
	const updatedSource = source.replace(
		/(?<!\!)\[([^\]\n]+)\]\(([^)\n]+)\)/g,
		(match, label, target) => (isDemoTarget(path, target) ? label : match),
	);
	if (source !== updatedSource)
		markdownChangeList.push({ path: absolutePath, source: updatedSource });
}

const removePathList = demoDirectoryList.filter((path) =>
	existsSync(safeResolve(path)),
);
for (const path of removePathList) {
	const info = lstatSync(safeResolve(path));
	if (info.isSymbolicLink())
		throw new Error(`symlink 디렉터리는 제거하지 않습니다: ${path}`);
	if (!info.isDirectory())
		throw new Error(`예상한 Demo 디렉터리가 아닙니다: ${path}`);
}

if (dryRun) {
	console.log("Demo 제거 계획:");
	for (const path of removePathList) console.log(`- 제거: ${path}/`);
	if (removeAppTest) console.log(`- 제거: ${appTestPath}`);
	if (hasDemoMarker) console.log(`- 수정: ${appPath}에서 Demo entry 제거`);
	if (markdownChangeList.length)
		console.log(
			`- 수정: Demo source를 가리키는 문서 링크 ${markdownChangeList.length}개`,
		);
	if (!removePathList.length && !removeAppTest && !hasDemoMarker)
		console.log("- 제거할 Demo source가 없습니다.");
	process.exit(0);
}

if (hasDemoMarker) writeFileSync(appFilePath, appSource);
for (const { path, source } of markdownChangeList) writeFileSync(path, source);
for (const path of removePathList)
	rmSync(safeResolve(path), { recursive: true });
if (removeAppTest) rmSync(appTestFilePath);

console.log("Demo 화면과 runtime을 제거했습니다.");
console.log("공통 UI, consumer contract, route helper는 유지했습니다.");
