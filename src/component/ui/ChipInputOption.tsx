import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ChipInputOptionProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"children" | "className" | "type"
> & {
	readonly children: ReactNode;
	readonly detail?: ReactNode;
	readonly isActive?: boolean;
	readonly tone?: "default" | "muted";
};

export const ChipInputOption = ({
	children,
	detail,
	isActive = false,
	tone = "default",
	...buttonProps
}: ChipInputOptionProps) => (
	<button
		aria-selected={false}
		className={
			tone === "muted"
				? `
      flex w-full cursor-pointer items-center
      gap-3 border-t border-r-0 border-b-0
      border-l-0 border-solid border-border bg-transparent
      px-4 py-3 text-left text-[13.5px]
      text-text-muted hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-2
      focus-visible:-outline-offset-2 focus-visible:outline-focus [&_span]:ml-auto [&_span]:text-caption
      [&_span]:text-text-subtle
    `
				: `
      flex w-full cursor-pointer items-center
      gap-3 rounded-sm border-0 bg-transparent
      px-4 py-3 text-left text-[13.5px]
      text-text hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-2
      focus-visible:-outline-offset-2 focus-visible:outline-focus data-[active=true]:bg-canvas [&_span]:ml-auto
      [&_span]:text-caption [&_span]:text-text-subtle
    `
		}
		data-active={isActive}
		role="option"
		type="button"
		{...buttonProps}
	>
		{children}
		{detail === undefined ? null : <span>{detail}</span>}
	</button>
);
