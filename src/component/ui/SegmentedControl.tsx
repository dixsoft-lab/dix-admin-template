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
		<fieldset className="dix-segmented">
			<legend>{label}</legend>
			<div>
				{optionList.map((option) => (
					<label key={option.value}>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={value === option.value}
							disabled={option.disabled}
							onChange={() => onChange(option.value)}
						/>
						<span>{option.label}</span>
					</label>
				))}
			</div>
		</fieldset>
	);
};
