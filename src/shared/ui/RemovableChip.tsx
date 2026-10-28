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
	<span className="dix-chip" title={title}>
		<span>{label}</span>
		<button
			aria-label={removeLabel}
			disabled={disabled}
			onClick={onRemove}
			type="button"
		>
			<span aria-hidden="true">×</span>
		</button>
	</span>
);
