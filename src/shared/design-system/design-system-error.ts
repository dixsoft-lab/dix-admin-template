export class DesignSystemConfigurationError extends Error {
	readonly name = "DesignSystemConfigurationError";

	constructor(
		readonly code: "invalid-provider" | "missing-export",
		readonly detail: string,
	) {
		super(`Design system ${code}: ${detail}`);
	}
}
