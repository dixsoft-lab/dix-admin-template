import type { BadgeProps } from "../design-system-contract";

const toneClassNameByTone = {
	neutral: "bg-surface-muted text-text-muted",
	success: "bg-surface-muted text-positive",
	warning: "bg-surface-muted text-warning",
	danger: "bg-surface-muted text-negative",
} as const;

export const EmbeddedBadge = ({
	tone = "neutral",
	className = "",
	...props
}: BadgeProps) => (
	<span
		{...props}
		className={`inline-flex items-center rounded-sm px-2 py-1 text-caption font-semibold ${toneClassNameByTone[tone]} ${className}`}
	/>
);
