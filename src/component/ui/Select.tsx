import type { ComponentPropsWithRef } from "react";

export type SelectProps = ComponentPropsWithRef<"select">;

export const Select = ({ children, className = "", ...props }: SelectProps) => (
	<div className="relative min-w-0">
		<select
			{...props}
			className={`
     h-10 w-full cursor-pointer appearance-none
     rounded-md border border-border-strong bg-surface
     py-0 pl-3 pr-9 font-sans
     text-[13.5px] font-semibold tracking-[-0.01em] text-text
     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed
     disabled:text-text-subtle
     ${className}
			`}
		>
			{children}
		</select>
		<svg
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="
     pointer-events-none absolute top-1/2 right-3
     size-3 -translate-y-1/2 text-text-muted
   "
			aria-hidden="true"
		>
			<path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
		</svg>
	</div>
);
