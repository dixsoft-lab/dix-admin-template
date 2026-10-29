import {
	type DesignSystemComponentMap,
	type DesignSystemSelection,
	designSystemExportNameList,
} from "./design-system-contract";
import { DesignSystemConfigurationError } from "./design-system-error";
import { embeddedDesignSystem } from "./embedded/embedded-design-system";

const rejectProvider = (selection: never): never => {
	throw new DesignSystemConfigurationError(
		"invalid-provider",
		`embedded, workspace 또는 external이 필요합니다: ${JSON.stringify(selection)}`,
	);
};

export const resolveDesignSystem = (
	selection: DesignSystemSelection,
): DesignSystemComponentMap => {
	switch (selection.mode) {
		case "embedded":
			return embeddedDesignSystem;
		case "workspace":
		case "external":
			for (const exportName of designSystemExportNameList) {
				if (selection.component?.[exportName] == null) {
					throw new DesignSystemConfigurationError(
						"missing-export",
						`${selection.mode} provider의 ${exportName} export가 필요합니다.`,
					);
				}
			}
			return selection.component;
		default:
			return rejectProvider(selection);
	}
};
