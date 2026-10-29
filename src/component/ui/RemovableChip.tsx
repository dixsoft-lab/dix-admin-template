export type RemovableChipProps = {
	readonly label: string;
	readonly removeLabel: string;
	readonly title?: string;
	readonly disabled?: boolean;
	readonly onRemove: () => void;
};

export const RemovableChip = ({
	label,
	removeLabel,
	title,
	disabled,
	onRemove,
}: RemovableChipProps) => (
	<span
		className="inline-flex min-h-[26px] min-w-0 max-w-full items-center gap-2 rounded-pill bg-primary px-2 py-0.5 pl-3 text-meta font-semibold text-on-primary"
		title={title}
	>
		<span className="overflow-hidden text-ellipsis whitespace-nowrap">
			{label}
		</span>
		<button
			className="grid size-[22px] shrink-0 place-items-center rounded-full bg-transparent p-0 [font:inherit] text-inherit hover:enabled:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
			aria-label={removeLabel}
			disabled={disabled}
			onClick={onRemove}
			type="button"
		>
			<span aria-hidden="true">×</span>
		</button>
	</span>
);
