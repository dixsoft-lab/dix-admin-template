import type { ReactNode } from "react";
import { RemovableChip } from "./RemovableChip";

export type ChipValue = {
	readonly value: string;
	readonly label: string;
	readonly removeLabel: string;
	readonly title?: string;
};

export type ChipInputProps = {
	readonly label: string;
	readonly valueList: readonly ChipValue[];
	readonly input: ReactNode;
	readonly hasError?: boolean;
	readonly disabled?: boolean;
	readonly onRemoveValue: (value: string) => void;
};

export const ChipInput = ({
	label,
	valueList,
	input,
	hasError,
	disabled,
	onRemoveValue,
}: ChipInputProps) => (
	<div
		className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus data-[invalid]:border-negative"
		role="group"
		aria-label={label}
		data-invalid={hasError || undefined}
	>
		{valueList.map((value) => (
			<RemovableChip
				key={value.value}
				label={value.label}
				removeLabel={value.removeLabel}
				title={value.title}
				disabled={disabled}
				onRemove={() => onRemoveValue(value.value)}
			/>
		))}
		{input}
	</div>
);
