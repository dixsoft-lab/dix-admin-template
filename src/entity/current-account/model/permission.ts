export interface PermissionAdapter {
	readonly capabilityList: readonly string[];
	readonly allows: (capability: string) => boolean;
}

export const canAccessCapability = (
	permission: PermissionAdapter,
	capability: string,
): boolean => {
	if (!permission.capabilityList.includes(capability)) return false;
	return permission.allows(capability) === true;
};
