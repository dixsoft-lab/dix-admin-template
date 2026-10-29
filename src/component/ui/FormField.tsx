import type { ReactNode } from "react";

export type FormFieldProps = {
	readonly label: string;
	readonly htmlFor: string;
	readonly hint?: ReactNode;
	readonly error?: ReactNode;
	readonly required?: boolean;
	readonly children: ReactNode;
};

export const FormField = ({
	label,
	htmlFor,
	hint,
	error,
	required,
	children,
}: FormFieldProps) => (
	<div className="grid gap-2">
		<label className="font-semibold" htmlFor={htmlFor}>
			{label}
			{required && <span aria-hidden="true"> *</span>}
		</label>
		{children}
		{hint && (
			<div className="text-meta text-text-muted" id={htmlFor + "-hint"}>
				{hint}
			</div>
		)}
		{error && (
			<div
				className="text-meta text-negative"
				id={htmlFor + "-error"}
				role="alert"
			>
				{error}
			</div>
		)}
	</div>
);
