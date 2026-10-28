import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const optionList = process.argv.slice(2);
const fixture = optionList[0]?.replace("--fixture=", "");
const fixtureList = ["retained-domain-prop", "backend-import"];
if (
	optionList.length > 1 ||
	(optionList.length === 1 && !optionList[0].startsWith("--fixture=")) ||
	(fixture && !fixtureList.includes(fixture))
) {
	console.error(`지원하는 fixture: ${fixtureList.join(", ")}`);
	process.exit(1);
}

const sourceMap = new Map();
const collect = async (directory) => {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) await collect(path);
		else if ([".ts", ".tsx", ".js", ".jsx", ".css"].includes(extname(path)))
			sourceMap.set(relative(root, path), await readFile(path, "utf8"));
	}
};
await collect(join(root, "src"));
const fixturePath = "src/shared/ui/FormField.tsx";
if (fixture === "retained-domain-prop")
	sourceMap.set(
		fixturePath,
		`${sourceMap.get(fixturePath)}\nexport type RetainedProps = { readonly storyId: string };\n`,
	);
if (fixture === "backend-import")
	sourceMap.set(
		fixturePath,
		`${sourceMap.get(fixturePath)}\nimport { getAuth } from "firebase/auth";\n`,
	);

const failureList = [];
const forbiddenModule =
	/^(?:firebase(?:\/|$)|@firebase\/|@sentry\/|@mi-user-story\/)|cloudfunctions\.net|miuserstory/i;
const forbiddenIdentifier =
	/^(?:[Ss]tory(?:$|[A-Z_])|[Mm]oderation(?:$|[A-Z_])|[Rr]eport(?:$|[A-Z_])|[Mm]anageAccount|[Aa]ccountTransfer|[Uu]sp(?:$|[A-Z_]))/;
const forbiddenLiteral =
	/^(?:l1|l2)$|MI User\s*Story|miuserstory|https?:\/\/[^\s]*(?:cloudfunctions\.net|firebaseio\.com)/i;
const forbiddenPath =
	/(?:^|\/)(?:story|moderation|report|manage-account|firebase)(?:\/|\.)/;
let inspectedCount = 0;
for (const [path, source] of sourceMap) {
	if (/\.test\.[^.]+$|\/fixture\//.test(path)) continue;
	inspectedCount += 1;
	if (forbiddenPath.test(path))
		failureList.push(
			`${path}:1: USP Domain 경로를 template core에 둘 수 없습니다.`,
		);
	if (path.endsWith(".css")) {
		const match = /--(?:usp|mi-user-story)-|\.usp-|miuserstory/i.exec(source);
		if (match)
			failureList.push(
				`${path}:${source.slice(0, match.index).split("\n").length}: 제품 전용 CSS 식별자 ${match[0]}`,
			);
		continue;
	}
	const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
	if (file.parseDiagnostics.length) {
		for (const diagnostic of file.parseDiagnostics)
			failureList.push(
				`${path}:${file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1}: source parse 오류: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
			);
		continue;
	}
	const report = (node, message) => {
		const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
		failureList.push(`${path}:${line + 1}: ${message}`);
	};
	const visit = (node) => {
		if (ts.isIdentifier(node) && forbiddenIdentifier.test(node.text))
			report(
				node,
				`제품 Domain 식별자 ${node.text}를 generic prop/model에서 제거하세요.`,
			);
		if (ts.isStringLiteralLike(node)) {
			if (node.parent?.name === node && forbiddenIdentifier.test(node.text))
				report(
					node,
					`제품 Domain 식별자 ${node.text}를 generic prop/model에서 제거하세요.`,
				);
			if (forbiddenModule.test(node.text))
				report(
					node,
					`제품 backend/telemetry 의존성 ${node.text}를 제거하세요.`,
				);
			else if (forbiddenLiteral.test(node.text))
				report(
					node,
					`제품 role·brand·endpoint 값 ${node.text}를 consumer contract로 교체하세요.`,
				);
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
}
const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
for (const dependency of Object.keys({
	...manifest.dependencies,
	...manifest.devDependencies,
}))
	if (forbiddenModule.test(dependency))
		failureList.push(
			`package.json: 제품 backend/telemetry dependency ${dependency}`,
		);
if (failureList.length) {
	console.error(failureList.join("\n"));
	process.exit(1);
}
console.log(
	`PASS: ${inspectedCount}개 runtime source의 AST prop·model·import·role·brand·CSS Domain 경계`,
);
