import { Button } from "./Button";
import type { ButtonProps } from "./design-system-contract";

export type PendingButtonProps = ButtonProps & {
	readonly pending?: boolean;
};

export const PendingButton = ({
	pending = false,
	disabled,
	className = "",
	children,
	type = "button",
	...prop
}: PendingButtonProps) => (
	<Button
		{...prop}
		className={`inline-flex items-center justify-center gap-2 ${className}`}
		type={type}
		disabled={disabled || pending}
		aria-busy={pending || undefined}
	>
		{pending && (
			<span
				className="size-3.5 shrink-0 animate-spinner rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
				aria-hidden="true"
			/>
		)}
		{children}
	</Button>
);
