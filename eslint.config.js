import path from "node:path";
import { fileURLToPath } from "node:url";
import typescriptParser from "@typescript-eslint/parser";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

const createTailwindConfig = (fileList, entryPoint) => ({
	files: fileList,
	languageOptions: {
		parser: typescriptParser,
		parserOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
	plugins: {
		"better-tailwindcss": betterTailwindcss,
	},
	settings: {
		"better-tailwindcss": {
			cwd: rootDirectory,
			entryPoint: path.join(rootDirectory, entryPoint),
		},
	},
	rules: {
		"better-tailwindcss/enforce-consistent-line-wrapping": [
			"warn",
			{
				classesPerLine: 4,
				group: "never",
				printWidth: 0,
				preferSingleLine: true,
			},
		],
	},
});

export default [
	{
		ignores: ["dist/**", "coverage/**", "node_modules/**"],
	},
	createTailwindConfig(
		["src/**/*.{js,jsx,mjs,cjs,ts,tsx}"],
		"src/style/tailwind.css",
	),
];
