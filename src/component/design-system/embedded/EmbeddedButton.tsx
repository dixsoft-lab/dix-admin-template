import type { ButtonProps } from "../design-system-contract";

export const EmbeddedButton = ({
	variant = "primary",
	type = "button",
	className = "",
	...props
}: ButtonProps) => (
	<button
		{...props}
		type={type}
		className={`dix-admin-button dix-admin-button--${variant} ${className}`}
	/>
);
