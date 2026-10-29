import type { BadgeProps } from "../design-system-contract";

const toneClassNameByTone = {
	neutral: "border border-border bg-surface text-text-secondary",
	primary: "border border-transparent bg-primary-soft text-primary-strong",
	success: "border border-transparent bg-surface-muted text-positive",
	warning: "border border-transparent bg-warning-surface text-warning",
	danger: "border border-transparent bg-negative-surface text-negative",
	quiet: "border border-border bg-surface text-text-subtle",
} as const;

export const EmbeddedBadge = ({
	tone = "neutral",
	className = "",
	...props
}: BadgeProps) => (
	<span
		{...props}
		className={`
    inline-flex min-h-5.75 items-center rounded-pill
    px-2.25 py-px text-caption font-semibold
    ${toneClassNameByTone[tone]} ${className}`}
	/>
);
