import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const optionList = process.argv.slice(2);
const fixture = optionList[0]?.replace("--fixture=", "");
const fixtureList = [
	"role-violation",
	"deep-import",
	"relative-boundary",
	"cross-module",
];
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
		else sourceMap.set(relative(root, path), await readFile(path, "utf8"));
	}
};
await collect(join(root, "src"));
const append = (path, source) =>
	sourceMap.set(path, `${sourceMap.get(path) ?? ""}\n${source}\n`);
if (fixture === "role-violation")
	append(
		"src/component/ui/AsyncState.tsx",
		'import { AdminShell } from "@admin/layout/admin";',
	);
if (fixture === "deep-import")
	append(
		"src/app/App.tsx",
		'import { DemoFormPage } from "@admin/page/demo/DemoFormPage";',
	);
if (fixture === "relative-boundary")
	append("src/app/App.tsx", 'import { DemoListPage } from "../page/demo";');
if (fixture === "cross-module") {
	append(
		"src/contract/authentication/auth-adapter.ts",
		'import { sample } from "../sample/sample";',
	);
	sourceMap.set("src/contract/sample/index.ts", "export const sample = 1;\n");
	sourceMap.set("src/contract/sample/sample.ts", "export const sample = 1;\n");
}

const roleDependencyMap = {
	app: new Set([
		"app",
		"page",
		"layout",
		"component",
		"contract",
		"hook",
		"route",
		"style",
	]),
	page: new Set(["component", "contract", "hook", "route", "style"]),
	layout: new Set(["component", "contract", "hook", "route", "style"]),
	component: new Set(["component", "contract", "hook", "route", "style"]),
	contract: new Set(["contract"]),
	hook: new Set(["contract", "route"]),
	route: new Set(),
	style: new Set(),
};
const roleSet = new Set(Object.keys(roleDependencyMap));
const codeExtensionSet = new Set([".ts", ".tsx", ".js", ".jsx"]);
const cssEntrySet = new Set([
	"src/component/design-system/styles.css",
	"src/component/design-system/tokens.css",
	"src/component/ui/ui.css",
	"src/style/shell.css",
]);
const classify = (path) => {
	if (path === "src/main.tsx" || path === "src/vite-env.d.ts")
		return { role: "bootstrap", module: "bootstrap" };
	const pathList = path.split("/");
	const role = pathList[1];
	const module = ["app", "hook", "route", "style"].includes(role)
		? role
		: (pathList[2] ?? role);
	return { role, module };
};
const resolveImport = (path, specifier) => {
	let target;
	if (specifier.startsWith("@admin/")) target = `src/${specifier.slice(7)}`;
	else if (specifier.startsWith("."))
		target = posix.normalize(posix.join(posix.dirname(path), specifier));
	else return undefined;
	return (
		[
			target,
			...[
				".ts",
				".tsx",
				".js",
				".jsx",
				".d.ts",
				".css",
				"/index.ts",
				"/index.tsx",
			].map((suffix) => target + suffix),
		].find((candidate) => sourceMap.has(candidate)) ?? null
	);
};
const moduleEntryPath = ({ role, module }) =>
	module === role ? `src/${role}/index.ts` : `src/${role}/${module}/index.ts`;
const failureList = [];
const graph = new Map();
let importCount = 0;
for (const [path, source] of sourceMap) {
	if (!codeExtensionSet.has(extname(path)) || /\/fixture\//.test(path))
		continue;
	const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
	const from = classify(path);
	if (
		!roleSet.has(from.role) &&
		!["src/main.tsx", "src/vite-env.d.ts"].includes(path)
	)
		failureList.push(`${path}:1: 알려진 source 역할 밖의 파일입니다.`);
	if (file.parseDiagnostics.length) {
		for (const diagnostic of file.parseDiagnostics)
			failureList.push(
				`${path}:${file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1}: source parse 오류: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
			);
		continue;
	}
	const edgeList = [];
	graph.set(path, edgeList);
	const check = (node) => {
		const specifier = node.text;
		const target = resolveImport(path, specifier);
		if (target === undefined) return;
		const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
		const report = (message) =>
			failureList.push(`${path}:${line + 1}: ${message} (${specifier})`);
		if (target === null) return report("내부 import 대상이 없습니다");
		importCount += 1;
		edgeList.push(target);
		const to = classify(target);
		const allowedRoleSet = roleDependencyMap[from.role];
		if (from.role !== to.role && allowedRoleSet && !allowedRoleSet.has(to.role))
			report(`책임 방향 위반: ${from.role} → ${to.role}`);
		if (path === "src/main.tsx" && target === "src/app/App.tsx") return;
		if (from.role === "bootstrap")
			return report("bootstrap은 @admin/app/App만 참조할 수 있습니다");
		const sameModule = from.role === to.role && from.module === to.module;
		if (sameModule) {
			if (specifier.startsWith("@admin/"))
				report("같은 모듈 내부에서는 상대 경로를 사용하세요");
			return;
		}
		if (!specifier.startsWith("@admin/"))
			return report("역할·모듈 경계에서는 @admin 공개 API를 사용하세요");
		if (cssEntrySet.has(target)) return;
		if (target !== moduleEntryPath(to)) report(`공개 index.ts 우회: ${target}`);
	};
	const visit = (node) => {
		if (
			(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
			node.moduleSpecifier &&
			ts.isStringLiteralLike(node.moduleSpecifier)
		)
			check(node.moduleSpecifier);
		if (
			ts.isImportTypeNode(node) &&
			ts.isLiteralTypeNode(node.argument) &&
			ts.isStringLiteralLike(node.argument.literal)
		)
			check(node.argument.literal);
		if (
			ts.isCallExpression(node) &&
			(node.expression.kind === ts.SyntaxKind.ImportKeyword ||
				(ts.isIdentifier(node.expression) &&
					node.expression.text === "require"))
		) {
			const argument = node.arguments[0];
			if (argument && ts.isStringLiteralLike(argument)) check(argument);
			else
				failureList.push(
					`${path}:${file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1}: dynamic import/require의 경계를 정적으로 판정할 수 없습니다.`,
				);
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
}
const visited = new Set();
const active = new Set();
const visitGraph = (path, trail) => {
	if (active.has(path)) {
		failureList.push(
			`${path}:1: 순환 import: ${[...trail.slice(trail.indexOf(path)), path].join(" → ")}`,
		);
		return;
	}
	if (visited.has(path)) return;
	active.add(path);
	for (const target of graph.get(path) ?? [])
		visitGraph(target, [...trail, path]);
	active.delete(path);
	visited.add(path);
};
for (const path of graph.keys()) visitGraph(path, []);
if (failureList.length) {
	console.error([...new Set(failureList)].join("\n"));
	process.exit(1);
}
console.log(
	`PASS: ${graph.size}개 source·${importCount}개 내부 import의 역할 의존·모듈 공개 API·순환 경계`,
);
