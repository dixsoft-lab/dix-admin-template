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
		className="
    inline-flex h-6.5 max-w-full min-w-0
    items-center gap-1.5 rounded-pill bg-primary-strong
    py-0 pr-1.5 pl-3 text-[12.5px]
    font-semibold text-on-primary
  "
		title={title}
	>
		<span className="overflow-hidden text-ellipsis whitespace-nowrap">
			{label}
		</span>
		<button
			className="
     grid size-4.5 shrink-0 place-items-center
     rounded-full border-0 bg-transparent p-0
     text-[11px] leading-none text-inherit hover:enabled:bg-[rgb(255_255_255/24%)]
     disabled:cursor-not-allowed disabled:opacity-60 focus-visible:shadow-[0_0_0_3px_rgb(2_74_216/25%)] focus-visible:outline-none
   "
			aria-label={removeLabel}
			disabled={disabled}
			onClick={onRemove}
			type="button"
		>
			<span aria-hidden="true">✕</span>
		</button>
	</span>
);
