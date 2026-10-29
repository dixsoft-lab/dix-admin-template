import { useId } from "react";

export type SegmentOption<Value extends string> = {
	readonly value: Value;
	readonly label: string;
	readonly disabled?: boolean;
};
export type SegmentedControlProps<Value extends string> = {
	readonly label: string;
	readonly optionList: readonly SegmentOption<Value>[];
	readonly value: Value;
	readonly onChange: (value: Value) => void;
};

export const SegmentedControl = <Value extends string>({
	label,
	optionList,
	value,
	onChange,
}: SegmentedControlProps<Value>) => {
	const name = useId();
	return (
		<fieldset className="m-0 border-0 p-0">
			<legend className="mb-2 font-semibold">{label}</legend>
			<div className="inline-flex flex-wrap gap-1 rounded-md border border-border bg-surface-muted p-1">
				{optionList.map((option) => (
					<label key={option.value}>
						<input
							className="peer absolute size-px opacity-0"
							type="radio"
							name={name}
							value={option.value}
							checked={value === option.value}
							disabled={option.disabled}
							onChange={() => onChange(option.value)}
						/>
						<span className="block cursor-pointer rounded-sm px-3 py-2 peer-checked:bg-surface peer-checked:font-semibold peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
							{option.label}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
};
