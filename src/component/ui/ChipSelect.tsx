import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChipInput, type ChipValue } from "./ChipInput";

export type ChipSelectOption = {
	readonly value: string;
	readonly label: string;
	readonly disabled?: boolean;
};

export type ChipSelectProps = {
	readonly label: string;
	readonly placeholder: string;
	readonly valueList: readonly ChipValue[];
	readonly optionList: readonly ChipSelectOption[];
	readonly hasError?: boolean;
	readonly disabled?: boolean;
	readonly emptyLabel?: string;
	readonly onChange: (valueList: readonly ChipValue[]) => void;
};

export const ChipSelect = ({
	label,
	placeholder,
	valueList,
	optionList,
	hasError,
	disabled = false,
	emptyLabel = "선택할 항목이 없습니다.",
	onChange,
}: ChipSelectProps) => {
	const id = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const optionButtonRefList = useRef<Array<HTMLButtonElement | null>>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const selectedValueSet = new Set(valueList.map((item) => item.value));
	const enabledIndexList = optionList.flatMap((option, index) =>
		option.disabled ? [] : [index],
	);
	const selectedOptionList = valueList.map((value) => {
		const option = optionList.find((item) => item.value === value.value);
		return option ? { ...value, label: option.label } : value;
	});

	useEffect(() => {
		if (!isOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () =>
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || activeIndex === null) return;
		optionButtonRefList.current[activeIndex]?.focus();
	}, [activeIndex, isOpen]);

	const moveActiveOption = (currentIndex: number, direction: -1 | 1) => {
		if (enabledIndexList.length === 0) return;
		const currentPosition = enabledIndexList.indexOf(currentIndex);
		const nextPosition =
			(currentPosition + direction + enabledIndexList.length) %
			enabledIndexList.length;
		const nextIndex = enabledIndexList[nextPosition];
		if (nextIndex === undefined) return;
		setActiveIndex(nextIndex);
		optionButtonRefList.current[nextIndex]?.focus();
	};

	const openAtFirstOption = () => {
		if (disabled || enabledIndexList.length === 0) return;
		setActiveIndex(enabledIndexList[0] ?? null);
		setIsOpen(true);
	};

	const toggleOption = (option: ChipSelectOption) => {
		if (option.disabled) return;
		if (selectedValueSet.has(option.value)) {
			onChange(valueList.filter((item) => item.value !== option.value));
			return;
		}
		onChange([
			...valueList,
			{
				value: option.value,
				label: option.label,
				removeLabel: `${option.label} 제거`,
			},
		]);
	};

	const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ")
			return;
		event.preventDefault();
		if (isOpen) return;
		openAtFirstOption();
	};

	const handleOptionKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			moveActiveOption(index, 1);
			return;
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			moveActiveOption(index, -1);
			return;
		}
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			setIsOpen(false);
			setActiveIndex(null);
			rootRef.current
				?.querySelector<HTMLButtonElement>("[data-chip-select-trigger]")
				?.focus();
		}
	};

	return (
		<div className="relative" ref={rootRef}>
			<ChipInput
				label={label}
				valueList={selectedOptionList}
				hasError={hasError}
				disabled={disabled}
				onRemoveValue={(value) =>
					onChange(valueList.filter((item) => item.value !== value))
				}
				input={
					<button
						aria-haspopup="listbox"
						aria-expanded={isOpen}
						aria-controls={isOpen ? id : undefined}
						className="
        min-h-6.5 min-w-30 flex-[1_1_120px] cursor-pointer
        border-0 bg-transparent p-0 text-left
        font-[inherit] text-[13.5px] leading-[inherit] text-text-subtle
        hover:text-text-muted focus-visible:shadow-none focus-visible:outline-none disabled:cursor-not-allowed
      "
						data-chip-select-trigger=""
						disabled={disabled}
						type="button"
						onClick={() => {
							if (isOpen) {
								setIsOpen(false);
								setActiveIndex(null);
								return;
							}
							openAtFirstOption();
						}}
						onKeyDown={handleTriggerKeyDown}
					>
						<span aria-hidden="true">＋</span> {placeholder}
					</button>
				}
			/>
			{isOpen && !disabled && (
				<ul
					id={id}
					className="
       absolute left-0 top-full z-20
       mt-2 max-h-72 w-full max-w-80
       list-none overflow-y-auto rounded-md border
       border-solid border-primary bg-surface p-1
       shadow-[0_2px_8px_rgb(26_26_26/8%)]
     "
					role="listbox"
					aria-label={label}
					aria-multiselectable="true"
				>
					{optionList.map((option, index) => (
						<li className="m-0 p-0" key={option.value} role="presentation">
							<button
								aria-selected={selectedValueSet.has(option.value)}
								className="
          w-full cursor-pointer rounded-sm border-0
          bg-transparent px-3 py-2.5 text-left
          text-body text-text hover:bg-canvas focus-visible:outline-2
          focus-visible:-outline-offset-2 focus-visible:outline-focus aria-selected:bg-primary-soft aria-selected:font-semibold
          aria-selected:text-primary-strong disabled:cursor-not-allowed disabled:opacity-50
        "
								disabled={option.disabled}
								id={`${id}-${index}`}
								ref={(element) => {
									optionButtonRefList.current[index] = element;
								}}
								role="option"
								tabIndex={activeIndex === index ? 0 : -1}
								onClick={() => toggleOption(option)}
								onKeyDown={(event) => handleOptionKeyDown(event, index)}
							>
								{option.label}
							</button>
						</li>
					))}
					{optionList.length === 0 && (
						<li
							className="px-3 py-2.5 text-meta text-text-muted"
							role="presentation"
						>
							{emptyLabel}
						</li>
					)}
				</ul>
			)}
		</div>
	);
};
