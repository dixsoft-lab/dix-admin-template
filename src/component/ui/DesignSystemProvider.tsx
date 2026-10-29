import type { ReactNode } from "react";
import type { DesignSystemSelection } from "./design-system-contract";
import { DesignSystemContext } from "./design-system-context";
import { resolveDesignSystem } from "./resolve-design-system";

export type DesignSystemProviderProps = {
	readonly selection: DesignSystemSelection;
	readonly children: ReactNode;
};

export const DesignSystemProvider = ({
	selection,
	children,
}: DesignSystemProviderProps) => (
	<DesignSystemContext value={resolveDesignSystem(selection)}>
		{children}
	</DesignSystemContext>
);
