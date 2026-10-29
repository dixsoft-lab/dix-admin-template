import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const usage =
	"사용법: node check-canonical-classes.mjs --root <저장소> --stylesheet <CSS> [--path <소스> ...] [--classes <클래스 목록>] --root-font-size <px>";
const extensionSet = new Set([
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".cjs",
	".mts",
	".cts",
]);
const generatedDirectorySet = new Set([".git", "node_modules", "dist"]);

const parseArgument = () => {
	const option = { pathList: [], classList: [] };
	const argumentList = process.argv.slice(2);
	for (
		let argumentIndex = 0;
		argumentIndex < argumentList.length;
		argumentIndex++
	) {
		const flag = argumentList[argumentIndex];
		if (flag === "--help") return { help: true };
		if (
			![
				"--root",
				"--stylesheet",
				"--path",
				"--classes",
				"--root-font-size",
			].includes(flag)
		) {
			throw new Error(`알 수 없는 옵션: ${flag}`);
		}
		const value = argumentList[++argumentIndex];
		if (!value || value.startsWith("--"))
			throw new Error(`옵션 값 누락: ${flag}`);
		if (flag === "--path") option.pathList.push(value);
		else if (flag === "--classes") option.classList.push(value);
		else option[flag.slice(2)] = value;
	}
	if (!option.root || !option.stylesheet || !option["root-font-size"])
		throw new Error(usage);
	if (option.pathList.length === 0 && option.classList.length === 0)
		throw new Error("--path 또는 --classes를 지정해야 합니다.");
	const fontSize = Number(option["root-font-size"]);
	if (!Number.isFinite(fontSize) || fontSize <= 0)
		throw new Error("루트 글자 크기는 양수 px 값이어야 합니다.");
	return { ...option, root: path.resolve(option.root), fontSize };
};

const main = async () => {
	const option = parseArgument();
	if (option.help) {
		console.log(usage);
		return;
	}
	const stylesheet = path.resolve(option.root, option.stylesheet);
	const repoRequire = createRequire(path.join(option.root, "package.json"));
	const ts = repoRequire("typescript");
	const tailwindVersion = repoRequire("tailwindcss/package.json").version;
	const { __unstable__loadDesignSystem } = repoRequire("@tailwindcss/node");
	if (typeof __unstable__loadDesignSystem !== "function")
		throw new Error("설치된 Tailwind에 디자인 시스템 해석 API가 없습니다.");
	const design = await __unstable__loadDesignSystem(
		fs.readFileSync(stylesheet, "utf8"),
		{
			base: path.dirname(stylesheet),
			onDependency() {},
		},
	);
	if (typeof design.canonicalizeCandidates !== "function")
		throw new Error("설치된 Tailwind에 권장 표기 정규화 API가 없습니다.");

	const fileSet = new Set();
	const skippedDirectoryList = [];
	const skippedSymlinkList = [];
	const walk = (file, explicit = false) => {
		const stat = fs.lstatSync(file);
		if (stat.isSymbolicLink()) {
			if (explicit)
				throw new Error(
					`명시한 입력이 심볼릭 링크입니다. 실제 소스 경로를 지정하세요: ${file}`,
				);
			skippedSymlinkList.push(path.relative(option.root, file));
			return;
		}
		if (stat.isDirectory()) {
			if (generatedDirectorySet.has(path.basename(file))) {
				if (explicit)
					throw new Error(
						`생성물·의존성 경로 대신 제품 소스를 지정하세요: ${file}`,
					);
				skippedDirectoryList.push(path.relative(option.root, file));
				return;
			}
			for (const entry of fs.readdirSync(file)) walk(path.join(file, entry));
		} else if (extensionSet.has(path.extname(file))) fileSet.add(file);
		else if (explicit) throw new Error(`지원하지 않는 소스 확장자: ${file}`);
	};
	for (const input of option.pathList)
		walk(path.resolve(option.root, input), true);
	if (option.pathList.length > 0 && fileSet.size === 0)
		throw new Error("지정한 범위에서 지원하는 소스 파일을 찾지 못했습니다.");

	const candidateMap = new Map();
	const add = (value, location) => {
		for (const candidate of value.split(/\s+/)) {
			if (!candidate || design.parseCandidate(candidate).length === 0) continue;
			const locationList = candidateMap.get(candidate) ?? [];
			locationList.push(location);
			candidateMap.set(candidate, locationList);
		}
	};
	let dynamicTemplateCount = 0;
	for (const file of fileSet) {
		const source = ts.createSourceFile(
			file,
			fs.readFileSync(file, "utf8"),
			ts.ScriptTarget.Latest,
			true,
		);
		if (source.parseDiagnostics.length > 0)
			throw new Error(
				`소스 구문 해석 실패: ${path.relative(option.root, file)}`,
			);
		const visit = (node) => {
			if (ts.isTemplateExpression(node)) dynamicTemplateCount++;
			if (
				ts.isStringLiteral(node) ||
				ts.isNoSubstitutionTemplateLiteral(node) ||
				ts.isTemplateHead(node) ||
				ts.isTemplateMiddle(node) ||
				ts.isTemplateTail(node)
			) {
				const position = source.getLineAndCharacterOfPosition(
					node.getStart(source),
				);
				add(node.text, {
					file: path.relative(option.root, file),
					line: position.line + 1,
				});
			}
			ts.forEachChild(node, visit);
		};
		visit(source);
	}
	option.classList.forEach((value, classIndex) =>
		add(value, { file: `<클래스 입력 ${classIndex + 1}>`, line: 1 }),
	);

	const candidateList = [...candidateMap.keys()];
	const generatedCssList = design.candidatesToCss(candidateList);
	const unresolvedCandidateList = [];
	const canonicalSuggestionList = [];
	let recognizedUtilityCount = 0;
	for (
		let candidateIndex = 0;
		candidateIndex < candidateList.length;
		candidateIndex++
	) {
		const candidate = candidateList[candidateIndex];
		const locationList = candidateMap.get(candidate);
		if (generatedCssList[candidateIndex] === null) {
			unresolvedCandidateList.push({ candidate, locationList });
			continue;
		}
		recognizedUtilityCount++;
		const canonical = design.canonicalizeCandidates([candidate], {
			rem: option.fontSize,
		})[0];
		if (canonical !== candidate)
			canonicalSuggestionList.push({ candidate, canonical, locationList });
	}
	if (fileSet.size === 0 && recognizedUtilityCount === 0)
		throw new Error(
			"클래스 입력에서 생성 가능한 Tailwind 유틸리티를 찾지 못했습니다.",
		);
	console.log(
		JSON.stringify(
			{
				status:
					recognizedUtilityCount === 0
						? "no-recognized-utilities"
						: canonicalSuggestionList.length
							? "suggestions"
							: "canonical",
				root: option.root,
				stylesheet: path.relative(option.root, stylesheet),
				tailwindVersion,
				rootFontSize: option.fontSize,
				sourceFileCount: fileSet.size,
				recognizedUtilityCount,
				canonicalSuggestionCount: canonicalSuggestionList.length,
				suggestedOccurrenceCount: canonicalSuggestionList.reduce(
					(sum, item) => sum + item.locationList.length,
					0,
				),
				canonicalSuggestionList,
				unresolvedCandidateList,
				dynamicTemplateCount,
				skippedDirectoryList,
				skippedSymlinkList,
				limitations:
					"정적 문자열의 생성 가능한 유틸리티만 정규화합니다. 미해석 표식·동적 최종 클래스·source 탐지·모든 린트·화면 동등성은 별도 확인이 필요합니다.",
			},
			null,
			2,
		),
	);
	process.exitCode = canonicalSuggestionList.length ? 1 : 0;
};

try {
	await main();
} catch (error) {
	console.error(
		JSON.stringify({ status: "error", message: error.message }, null, 2),
	);
	process.exitCode = 2;
}
