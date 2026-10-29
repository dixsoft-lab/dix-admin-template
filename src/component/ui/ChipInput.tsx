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
	readonly suggestionList?: ReactNode;
	readonly hasError?: boolean;
	readonly disabled?: boolean;
	readonly onRemoveValue: (value: string) => void;
};

export const ChipInput = ({
	label,
	valueList,
	input,
	suggestionList,
	hasError,
	disabled,
	onRemoveValue,
}: ChipInputProps) => (
	<>
		<div
			className="
     flex min-h-10 flex-wrap items-center
     gap-1.5 rounded-md border border-solid
     border-border-strong bg-surface px-3 py-2
     focus-within:shadow-[0_0_0_3px_rgb(2_74_216/25%)] data-invalid:border-negative [&_input]:h-6.5 [&_input]:min-h-6.5
     [&_input]:w-auto [&_input]:min-w-30 [&_input]:flex-[1_1_120px] [&_input]:rounded-md
     [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:font-[inherit]
     [&_input]:text-[13.5px] [&_input]:leading-[inherit] [&_input]:text-text [&_input]:focus:shadow-none
     [&_input]:focus:outline-none [&_input::placeholder]:text-text-subtle [&_button:focus-visible]:shadow-[0_0_0_3px_rgb(2_74_216/25%)] [&_button:focus-visible]:outline-none
   "
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
		{suggestionList}
	</>
);
