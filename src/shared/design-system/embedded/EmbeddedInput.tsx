import type { InputProps } from "../design-system-contract";

export const EmbeddedInput = ({ className = "", ...props }: InputProps) => (
	<input {...props} className={`dix-admin-input ${className}`} />
);
