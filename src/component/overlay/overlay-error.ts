export class OverlayConfigurationError extends Error {
	readonly name = "OverlayConfigurationError";

	constructor(
		readonly code:
			| "missing-provider"
			| "missing-theme-root"
			| "nested-provider"
			| "duplicate-host",
	) {
		super(`Overlay ${code}: theme root마다 OverlayProvider 하나가 필요합니다.`);
	}
}
