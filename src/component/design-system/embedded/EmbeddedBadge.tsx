import type { BadgeProps } from "../design-system-contract";

export const EmbeddedBadge = ({
	tone = "neutral",
	className = "",
	...props
}: BadgeProps) => (
	<span
		{...props}
		className={`dix-admin-badge dix-admin-badge--${tone} ${className}`}
	/>
);
