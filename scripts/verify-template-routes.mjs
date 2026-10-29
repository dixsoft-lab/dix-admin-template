import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const optionList = process.argv.slice(2);
const fixture = optionList[0]?.replace("--fixture=", "");
const fixtureList = [
	"constant-without-registration",
	"duplicate-raw-path",
	"basename-in-route-path",
	"registration-not-connected",
	"raw-href",
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
		else if (
			[".ts", ".tsx"].includes(extname(path)) &&
			!/\.test\.[^.]+$|\/fixture\//.test(path)
		)
			sourceMap.set(relative(root, path), await readFile(path, "utf8"));
	}
};
await collect(join(root, "src"));
const pathFile = "src/route/route-paths.ts";
const routerFile = "src/app/route/router.tsx";
if (fixture === "constant-without-registration")
	sourceMap.set(
		pathFile,
		sourceMap
			.get(pathFile)
			.replace(
				"export const routePath = {",
				'export const routePath = {\n\taudit: "/audit",',
			),
	);
if (fixture === "basename-in-route-path")
	sourceMap.set(
		pathFile,
		sourceMap
			.get(pathFile)
			.replace('overview: "/overview"', 'overview: "/admin/overview"'),
	);
if (fixture === "duplicate-raw-path")
	sourceMap.set(
		"src/app/demo/demo-adapter.ts",
		`${sourceMap.get("src/app/demo/demo-adapter.ts")}\nconst duplicateNavigation = { path: "/item", label: "중복 경로" };\n`,
	);
if (fixture === "registration-not-connected")
	sourceMap.set(
		routerFile,
		sourceMap
			.get(routerFile)
			.replace(
				"createBrowserRouter(createRouteList(element),",
				"createBrowserRouter([],",
			),
	);
if (fixture === "raw-href")
	sourceMap.set(
		"src/app/demo/DemoApp.tsx",
		`${sourceMap.get("src/app/demo/DemoApp.tsx")}\nconst rawLink = <a href="/item">항목</a>;\n`,
	);

const failureList = [];
const parse = (path) => {
	const file = ts.createSourceFile(
		path,
		sourceMap.get(path) ?? "",
		ts.ScriptTarget.Latest,
		true,
	);
	for (const diagnostic of file.parseDiagnostics)
		failureList.push(
			`${path}:${file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1}: source parse 오류: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
		);
	return file;
};
const report = (file, node, message) => {
	const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
	failureList.push(`${file.fileName}:${line + 1}: ${message}`);
};
const unwrap = (node) => {
	while (
		node &&
		(ts.isAsExpression(node) ||
			ts.isSatisfiesExpression(node) ||
			ts.isParenthesizedExpression(node))
	)
		node = node.expression;
	return node;
};
const getName = (node) =>
	node && (ts.isIdentifier(node) || ts.isStringLiteralLike(node))
		? node.text
		: undefined;
const pathSource = parse(pathFile);
const initializerMap = new Map();
for (const statement of pathSource.statements)
	if (ts.isVariableStatement(statement))
		for (const declaration of statement.declarationList.declarations)
			if (ts.isIdentifier(declaration.name))
				initializerMap.set(
					declaration.name.text,
					unwrap(declaration.initializer),
				);
const readString = (node, seen = new Set()) => {
	node = unwrap(node);
	if (node && ts.isStringLiteralLike(node)) return node.text;
	if (node && ts.isIdentifier(node) && !seen.has(node.text))
		return readString(
			initializerMap.get(node.text),
			new Set([...seen, node.text]),
		);
	return undefined;
};
const pathObject = initializerMap.get("routePath");
const basename = readString(initializerMap.get("routerBasename"));
if (basename !== "/")
	failureList.push(
		`${pathFile}:1: routerBasename의 기본값은 별도 "/"여야 합니다.`,
	);
const pathMap = new Map();
const builderList = [];
if (!pathObject || !ts.isObjectLiteralExpression(pathObject))
	failureList.push(`${pathFile}:1: routePath는 명시적 object여야 합니다.`);
else
	for (const property of pathObject.properties) {
		if (
			!ts.isPropertyAssignment(property) &&
			!ts.isShorthandPropertyAssignment(property)
		) {
			report(
				pathSource,
				property,
				"route path object의 spread·계산된 등록은 허용하지 않습니다.",
			);
			continue;
		}
		const name = getName(property.name);
		const initializer = ts.isShorthandPropertyAssignment(property)
			? initializerMap.get(name)
			: unwrap(property.initializer);
		if (!name) {
			report(pathSource, property, "route key는 정적 식별자여야 합니다.");
			continue;
		}
		if (
			initializer &&
			(ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
		) {
			builderList.push({ name, node: initializer });
			continue;
		}
		const value = readString(initializer);
		if (value === undefined || (value !== "*" && !value.startsWith("/")))
			report(
				pathSource,
				property,
				`${name}은 app-local absolute path 또는 wildcard여야 합니다.`,
			);
		else {
			if (/^\/admin(?:\/|$)/.test(value))
				report(
					pathSource,
					property,
					`${name}에 mount basename을 넣지 마세요. router option으로 분리하세요.`,
				);
			if ([...pathMap.values()].some((entry) => entry.value === value))
				report(pathSource, property, `중복 route path ${value}`);
			pathMap.set(name, { value, node: property });
		}
	}
for (const { name, node } of builderList) {
	const body = unwrap(node.body);
	if (
		!body ||
		!ts.isCallExpression(body) ||
		!ts.isIdentifier(body.expression) ||
		body.expression.text !== "generatePath"
	) {
		report(
			pathSource,
			node,
			`${name} dynamic builder는 generatePath(pattern, parameter)를 사용해야 합니다.`,
		);
		continue;
	}
	const pattern = readString(body.arguments[0]);
	if (
		!pattern ||
		!pattern.includes(":") ||
		![...pathMap.values()].some((entry) => entry.value === pattern)
	)
		report(
			pathSource,
			node,
			`${name} builder의 pattern이 등록 가능한 route path와 일치하지 않습니다.`,
		);
}

const registrationCount = new Map();
const routerSource = parse(routerFile);
let hasBasenameDefault = false;
const factoryMap = new Map();
for (const statement of routerSource.statements)
	if (ts.isVariableStatement(statement))
		for (const declaration of statement.declarationList.declarations)
			if (ts.isIdentifier(declaration.name))
				factoryMap.set(declaration.name.text, unwrap(declaration.initializer));
const returnedExpression = (factory) => {
	if (
		!factory ||
		(!ts.isArrowFunction(factory) && !ts.isFunctionExpression(factory))
	)
		return undefined;
	if (!ts.isBlock(factory.body)) return unwrap(factory.body);
	const returnList = factory.body.statements.filter(ts.isReturnStatement);
	if (returnList.length !== 1) return undefined;
	return unwrap(returnList[0].expression);
};
const isCall = (node, name) =>
	Boolean(
		node &&
		ts.isCallExpression(node) &&
		ts.isIdentifier(node.expression) &&
		node.expression.text === name,
	);
const routeFactory = factoryMap.get("createRouteList");
const registrationCall = returnedExpression(routeFactory);
const browserFactory = factoryMap.get("createRouter");
const browserCall = returnedExpression(browserFactory);
if (!isCall(registrationCall, "createRoutesFromElements"))
	report(
		routerSource,
		routeFactory ?? routerSource,
		"createRouteList는 등록 JSX를 담은 createRoutesFromElements 결과를 반환해야 합니다.",
	);
if (!isCall(browserCall, "createBrowserRouter"))
	report(
		routerSource,
		browserFactory ?? routerSource,
		"createRouter는 createBrowserRouter 결과를 반환해야 합니다.",
	);
else {
	if (!isCall(unwrap(browserCall.arguments[0]), "createRouteList"))
		report(
			routerSource,
			browserCall,
			"등록 연결 단절: createRouter의 createBrowserRouter에 createRouteList 결과를 전달하세요.",
		);
	const option = unwrap(browserCall.arguments[1]);
	if (
		!option ||
		!ts.isObjectLiteralExpression(option) ||
		!option.properties.some((property) => getName(property.name) === "basename")
	)
		report(
			routerSource,
			browserCall,
			"createBrowserRouter에 별도 basename option이 필요합니다.",
		);
}
const routeKey = (node) =>
	node &&
	ts.isPropertyAccessExpression(node) &&
	ts.isIdentifier(node.expression) &&
	node.expression.text === "routePath"
		? node.name.text
		: undefined;
const attributeExpression = (attribute) =>
	attribute?.initializer && ts.isJsxExpression(attribute.initializer)
		? attribute.initializer.expression
		: attribute?.initializer;
const visitBasename = (node) => {
	if (
		ts.isBindingElement(node) &&
		getName(node.name) === "basename" &&
		node.initializer &&
		ts.isIdentifier(node.initializer) &&
		node.initializer.text === "routerBasename"
	)
		hasBasenameDefault = true;
	ts.forEachChild(node, visitBasename);
};
if (browserFactory) visitBasename(browserFactory);
const visitRouter = (node) => {
	if (
		(ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
		node.tagName.getText(routerSource) === "Route"
	) {
		const attributeMap = new Map(
			node.attributes.properties
				.filter(ts.isJsxAttribute)
				.map((attribute) => [attribute.name.getText(routerSource), attribute]),
		);
		const pathAttribute = attributeMap.get("path");
		if (pathAttribute) {
			const key = routeKey(attributeExpression(pathAttribute));
			if (!key || !pathMap.has(key))
				report(
					routerSource,
					pathAttribute,
					"Route path는 routePath의 정적 path key를 참조해야 합니다.",
				);
			else registrationCount.set(key, (registrationCount.get(key) ?? 0) + 1);
			if (!attributeMap.has("element"))
				report(
					routerSource,
					node,
					"등록 route에는 실제 page/system element가 필요합니다.",
				);
			if (!attributeMap.has("handle"))
				report(
					routerSource,
					node,
					"등록 route에는 title/breadcrumb handle이 필요합니다.",
				);
		}
	}
	ts.forEachChild(node, visitRouter);
};
if (isCall(registrationCall, "createRoutesFromElements"))
	for (const argument of registrationCall.arguments) visitRouter(argument);
if (!hasBasenameDefault)
	failureList.push(
		`${routerFile}:1: createRouter에 별도 basename 기본값 계약을 유지하세요.`,
	);
for (const [name, entry] of pathMap)
	if (registrationCount.get(name) !== 1)
		report(
			pathSource,
			entry.node,
			`${name}(${entry.value})은 실제 router에 정확히 한 번 등록해야 합니다. 현재 ${registrationCount.get(name) ?? 0}회입니다.`,
		);

const isInternalHref = (value) =>
	value.startsWith("/") &&
	!value.startsWith("//") &&
	!value.startsWith("/assets/") &&
	!/\.(?:png|jpe?g|gif|webp|svg|ico|css|m?js|woff2?|ttf|otf|mp4|webm|mp3|wav|pdf|zip|txt|json)(?:[?#]|$)/i.test(
		value,
	);
let referenceCount = 0;
for (const [path] of sourceMap) {
	if (path === pathFile) continue;
	const file = parse(path);
	const visit = (node) => {
		const key = routeKey(node);
		if (key) {
			referenceCount += 1;
			if (
				!pathMap.has(key) &&
				!builderList.some((builder) => builder.name === key)
			)
				report(file, node, `선언되지 않은 route key ${key}`);
		}
		let candidate;
		let href;
		if (ts.isPropertyAssignment(node) && getName(node.name) === "href")
			href = unwrap(node.initializer);
		if (ts.isJsxAttribute(node) && node.name.getText(file) === "href")
			href = unwrap(attributeExpression(node));
		if (href && ts.isStringLiteralLike(href) && isInternalHref(href.text))
			report(
				file,
				href,
				`중복 raw href ${href.text}: 내부 탐색에는 route 공개 path API를 사용하세요.`,
			);
		if (
			ts.isPropertyAssignment(node) &&
			["path", "to"].includes(getName(node.name))
		)
			candidate = unwrap(node.initializer);
		if (
			ts.isJsxAttribute(node) &&
			["path", "to"].includes(node.name.getText(file))
		)
			candidate = unwrap(attributeExpression(node));
		if (
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			/^(?:navigate|redirect)$/.test(node.expression.text)
		)
			candidate = unwrap(node.arguments[0]);
		if (
			candidate &&
			ts.isStringLiteralLike(candidate) &&
			(candidate.text.startsWith("/") || candidate.text === "*")
		)
			report(
				file,
				candidate,
				`중복 raw route ${candidate.text}: route 공개 path API를 사용하세요.`,
			);
		ts.forEachChild(node, visit);
	};
	visit(file);
}
if (failureList.length) {
	console.error(failureList.join("\n"));
	process.exit(1);
}
console.log(
	`PASS: ${pathMap.size}개 path의 명시 등록·${builderList.length}개 dynamic builder·${referenceCount}개 navigation/guard/title/breadcrumb 참조·별도 basename`,
);
