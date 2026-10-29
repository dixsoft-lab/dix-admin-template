import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const argumentList = process.argv.slice(2);
const fixture = argumentList[0]?.replace("--fixture=", "");
const fixtureList = [
	"role-violation",
	"index-barrel",
	"relative-boundary",
	"cross-module",
];
if (
	argumentList.length > 1 ||
	(argumentList.length === 1 && !argumentList[0].startsWith("--fixture=")) ||
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
		'import { Shell } from "@/layout/Shell";',
	);
if (fixture === "index-barrel")
	sourceMap.set("src/component/ui/index.ts", "export * from './Button';\n");
if (fixture === "relative-boundary")
	append(
		"src/app/App.tsx",
		'import { routePath } from "../route/route-paths";',
	);
if (fixture === "cross-module")
	append(
		"src/contract/authentication/auth-adapter.ts",
		'import { canAccessCapability } from "../authorization/permission-adapter";',
	);

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
const cssEntryPath = "src/style/tailwind.css";
const classify = (path) => {
	if (path === "src/main.tsx" || path === "src/vite-env.d.ts")
		return { role: "bootstrap", module: "bootstrap" };
	const pathList = path.split("/");
	const role = pathList[1];
	const module = pathList.length > 3 ? pathList[2] : role;
	return { role, module };
};
const resolveImport = (path, specifier) => {
	let target;
	if (specifier.startsWith("@/")) target = `src/${specifier.slice(2)}`;
	else if (specifier.startsWith("."))
		target = posix.normalize(posix.join(posix.dirname(path), specifier));
	else return undefined;
	return (
		[
			target,
			...[".ts", ".tsx", ".js", ".jsx", ".d.ts", ".css"].map(
				(suffix) => target + suffix,
			),
		].find((candidate) => sourceMap.has(candidate)) ?? null
	);
};
const failureList = [];
const graph = new Map();
let importCount = 0;
for (const path of sourceMap.keys()) {
	if (/^src\/.*\/index\.(?:ts|tsx)$/.test(path))
		failureList.push(
			`${path}:1: source barrel은 허용하지 않습니다. 구체 source 파일을 사용하세요.`,
		);
}
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
			return report("bootstrap은 @/app/App만 참조할 수 있습니다");
		const sameModule = from.role === to.role && from.module === to.module;
		if (sameModule) {
			if (specifier.startsWith("@/"))
				report("같은 module 내부에서는 상대 경로를 사용하세요");
			return;
		}
		if (!specifier.startsWith("@/"))
			return report(
				"역할·module 경계에서는 @/ alias로 source 파일을 지정하세요",
			);
		if (target === cssEntryPath) return;
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
for (const path of sourceMap.keys()) {
	if (/^src\/.*\.css$/.test(path) && path !== cssEntryPath)
		failureList.push(
			`${path}:1: Tailwind 진입점 외 component CSS는 허용하지 않습니다.`,
		);
	if (
		/^src\//.test(path) &&
		/\b(?:Admin[A-Z][A-Za-z0-9]*|admin[A-Z][A-Za-z0-9]*)\b/.test(
			sourceMap.get(path) ?? "",
		)
	)
		failureList.push(
			`${path}:1: source 식별자에 불필요한 Admin 접두어가 있습니다.`,
		);
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
	`PASS: ${graph.size}개 source·${importCount}개 내부 import의 역할 의존·alias·barrel·CSS·순환 경계`,
);
