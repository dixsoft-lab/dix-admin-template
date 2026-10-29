import { useId, useState, type ReactNode } from "react";

export type DropzoneProps = {
	readonly label: string;
	readonly hint?: ReactNode;
	readonly accept?: string;
	readonly multiple?: boolean;
	readonly disabled?: boolean;
	readonly onFileChange: (fileList: readonly File[]) => void;
};

export const Dropzone = ({
	label,
	hint,
	accept,
	multiple = false,
	disabled = false,
	onFileChange,
}: DropzoneProps) => {
	const id = useId();
	const [isDragging, setIsDragging] = useState(false);
	return (
		<div
			className="
     grid min-w-0 gap-3 rounded-md
     border border-dashed border-border bg-surface
     p-6 data-dragging:border-primary data-dragging:bg-surface-muted data-disabled:opacity-60
   "
			data-dragging={isDragging || undefined}
			data-disabled={disabled || undefined}
			onDragOver={(event) => {
				event.preventDefault();
				if (!disabled) setIsDragging(true);
			}}
			onDragLeave={(event) => {
				if (
					!event.currentTarget.contains(
						event.relatedTarget instanceof Node ? event.relatedTarget : null,
					)
				)
					setIsDragging(false);
			}}
			onDrop={(event) => {
				event.preventDefault();
				setIsDragging(false);
				if (disabled) return;
				const fileList = Array.from(event.dataTransfer.files);
				onFileChange(multiple ? fileList : fileList.slice(0, 1));
			}}
		>
			<label className="font-semibold" htmlFor={id}>
				{label}
			</label>
			{hint && (
				<p className="m-0 text-text-muted" id={id + "-hint"}>
					{hint}
				</p>
			)}
			<input
				className="w-full min-w-0"
				id={id}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				aria-describedby={hint ? id + "-hint" : undefined}
				onChange={(event) => {
					onFileChange(Array.from(event.currentTarget.files ?? []));
					event.currentTarget.value = "";
				}}
			/>
		</div>
	);
};
