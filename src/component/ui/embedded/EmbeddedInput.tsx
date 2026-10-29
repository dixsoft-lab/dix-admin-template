import type { InputProps } from "../design-system-contract";

export const EmbeddedInput = ({ className = "", ...props }: InputProps) => (
	<input
		{...props}
		className={`
    box-border min-h-10 w-full rounded-md
    border border-border bg-surface px-3
    py-2 font-sans text-body text-text
    placeholder:text-text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
    disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-negative
    ${className}`}
	/>
);
