export type SegmentOption<Value extends string> = {
	readonly value: Value;
	readonly label: string;
	readonly disabled?: boolean;
};
export type SegmentedControlProps<Value extends string> = {
	readonly ariaLabel: string;
	readonly optionList: readonly SegmentOption<Value>[];
	readonly value: Value;
	readonly onChange: (value: Value) => void;
	readonly size?: "sm" | "md";
};

const sizeClassName = {
	sm: "h-7.5 px-4 text-[12.5px]",
	md: "h-9.5 px-4 text-[13.5px]",
} as const;

export const SegmentedControl = <Value extends string>({
	ariaLabel,
	optionList,
	value,
	onChange,
	size = "md",
}: SegmentedControlProps<Value>) => {
	const isThreeOptionSet = optionList.length === 3;
	return (
		<div
			className={`
     inline-flex w-fit max-w-full items-center
     overflow-hidden rounded-md border border-solid
     border-border-strong bg-surface
     ${isThreeOptionSet ? "max-[720px]:grid max-[720px]:grid-cols-3" : "max-[720px]:flex-wrap"}`}
			role="group"
			aria-label={ariaLabel}
		>
			{optionList.map((option) => (
				<button
					aria-pressed={value === option.value}
					className={`
       cursor-pointer border-0 border-r border-solid
       border-border py-0 leading-normal font-semibold
       tracking-[-0.02em] whitespace-nowrap transition-[background,color] duration-100
       last:border-r-0 focus-visible:shadow-[inset_0_0_0_3px_rgb(2_74_216/25%)] focus-visible:outline-none disabled:cursor-not-allowed
       disabled:opacity-50 motion-reduce:duration-[0.001ms]
       ${sizeClassName[size]} ${value === option.value ? "bg-primary-strong font-bold text-on-primary" : "bg-transparent text-text-muted hover:bg-canvas hover:text-text"} ${
					isThreeOptionSet
						? `
        max-[720px]:border-r max-[720px]:border-b max-[720px]:border-solid max-[720px]:border-border
        max-[720px]:px-2 max-[720px]:whitespace-normal max-[720px]:nth-[3n]:border-r-0 max-[720px]:nth-last-[-n+2]:border-b-0
      `
						: ""
				}`}
					key={option.value}
					type="button"
					disabled={option.disabled}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
};
