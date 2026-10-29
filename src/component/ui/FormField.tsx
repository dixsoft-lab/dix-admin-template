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
	<div className="dix-form-field">
		<label htmlFor={htmlFor}>
			{label}
			{required && <span aria-hidden="true"> *</span>}
		</label>
		{children}
		{hint && (
			<div className="dix-field-hint" id={htmlFor + "-hint"}>
				{hint}
			</div>
		)}
		{error && (
			<div className="dix-field-error" id={htmlFor + "-error"} role="alert">
				{error}
			</div>
		)}
	</div>
);
