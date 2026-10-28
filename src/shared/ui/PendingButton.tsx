import { Button, type ButtonProps } from "@admin/shared/design-system";

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
		className={"dix-pending-button " + className}
		type={type}
		disabled={disabled || pending}
		aria-busy={pending || undefined}
	>
		{pending && <span className="dix-spinner" aria-hidden="true" />}
		{children}
	</Button>
);
