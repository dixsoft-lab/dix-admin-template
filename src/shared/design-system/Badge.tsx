import type { BadgeProps } from "./design-system-contract";
import { useDesignSystem } from "./useDesignSystem";

export const Badge = (props: BadgeProps) => {
	const Component = useDesignSystem().Badge;
	return <Component {...props} />;
};
