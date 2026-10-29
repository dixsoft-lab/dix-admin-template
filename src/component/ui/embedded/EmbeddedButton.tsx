import type { ButtonProps } from "../design-system-contract";

const variantClassNameByVariant = {
	primary:
		"border border-transparent bg-primary text-on-primary hover:enabled:bg-primary-hover",
	secondary:
		"border border-border-strong bg-surface text-text-muted hover:enabled:bg-canvas hover:enabled:text-text",
	danger:
		"border border-negative bg-transparent text-negative hover:enabled:bg-negative-surface",
} as const;

export const EmbeddedButton = ({
	variant = "primary",
	type = "button",
	className = "",
	...props
}: ButtonProps) => (
	<button
		{...props}
		type={type}
		className={`
    inline-flex min-h-10 items-center justify-center
    gap-2 rounded-md px-3 py-2
    font-sans text-body font-medium transition-colors
    duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
    disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none
    ${variantClassNameByVariant[variant]} ${className}`}
	/>
);
