import type { ReactNode } from "react";

import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import { canAccessCapability } from "@/contract/authorization/permission-adapter";

type CapabilityBoundaryProps = {
	readonly permission: PermissionAdapter;
	readonly capability: string;
	readonly children: ReactNode;
	readonly fallback?: ReactNode;
};

export const CapabilityBoundary = ({
	permission,
	capability,
	children: child,
	fallback,
}: CapabilityBoundaryProps) => {
	if (!canAccessCapability(permission, capability)) {
		return fallback ?? <p role="alert">이 화면에 접근할 수 없습니다.</p>;
	}
	return child;
};
