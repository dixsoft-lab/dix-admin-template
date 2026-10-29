import { useId, useState, type KeyboardEvent } from "react";
import { Input } from "./Input";

export type ComboboxOption = {
	readonly value: string;
	readonly label: string;
	readonly disabled?: boolean;
};
export type ComboboxProps = {
	readonly id?: string;
	readonly label: string;
	readonly optionList: readonly ComboboxOption[];
	readonly value: string | null;
	readonly inputValue: string;
	readonly onInputChange: (value: string) => void;
	readonly onChange: (value: string) => void;
	readonly emptyLabel?: string;
	readonly disabled?: boolean;
};

export const Combobox = ({
	id,
	label,
	optionList,
	value,
	inputValue,
	onInputChange,
	onChange,
	emptyLabel = "선택할 항목이 없습니다.",
	disabled = false,
}: ComboboxProps) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const listId = inputId + "-option";
	const [isOpen, setIsOpen] = useState(false);
	const [activeValue, setActiveValue] = useState<string | null>(null);
	const enabledOptionList = optionList.filter((option) => !option.disabled);
	const activeIndex = optionList.findIndex(
		(option) => option.value === activeValue && !option.disabled,
	);
	const select = (option: ComboboxOption) => {
		if (option.disabled) return;
		onChange(option.value);
		setIsOpen(false);
		setActiveValue(null);
	};
	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp": {
				event.preventDefault();
				setIsOpen(true);
				const currentIndex = enabledOptionList.findIndex(
					(option) => option.value === activeValue,
				);
				const delta = event.key === "ArrowDown" ? 1 : -1;
				let nextIndex = currentIndex + delta;
				if (nextIndex < 0) nextIndex = enabledOptionList.length - 1;
				if (nextIndex >= enabledOptionList.length) nextIndex = 0;
				setActiveValue(enabledOptionList[nextIndex]?.value ?? null);
				break;
			}
			case "Enter": {
				const option = optionList[activeIndex];
				if (isOpen && option) {
					event.preventDefault();
					select(option);
				}
				break;
			}
			case "Escape":
				if (isOpen) {
					event.preventDefault();
					event.stopPropagation();
					setIsOpen(false);
					setActiveValue(null);
				}
				break;
			default:
				break;
		}
	};
	return (
		<div className="relative grid gap-2">
			<label className="font-semibold" htmlFor={inputId}>
				{label}
			</label>
			<Input
				id={inputId}
				role="combobox"
				autoComplete="off"
				disabled={disabled}
				aria-autocomplete="list"
				aria-expanded={isOpen && !disabled}
				aria-controls={isOpen ? listId : undefined}
				aria-activedescendant={
					isOpen && activeIndex >= 0 ? listId + "-" + activeIndex : undefined
				}
				value={inputValue}
				onFocus={() => setIsOpen(true)}
				onBlur={() => {
					setIsOpen(false);
					setActiveValue(null);
				}}
				onChange={(event) => {
					onInputChange(event.target.value);
					setActiveValue(null);
					setIsOpen(true);
				}}
				onKeyDown={handleKeyDown}
			/>
			{isOpen && !disabled && (
				<ul
					id={listId}
					role="listbox"
					aria-label={label}
					className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 list-none overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-overlay"
				>
					{optionList.map((option, index) => (
						<li
							key={option.value}
							id={listId + "-" + index}
							role="option"
							aria-selected={option.value === value}
							aria-disabled={option.disabled || undefined}
							data-active={index === activeIndex || undefined}
							className="cursor-pointer rounded-sm px-3 py-2.5 data-[active]:bg-surface-muted aria-[selected=true]:font-semibold aria-[selected=true]:text-primary aria-disabled:cursor-not-allowed aria-disabled:text-text-muted aria-disabled:opacity-60 hover:bg-surface-muted"
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => select(option)}
						>
							{option.label}
						</li>
					))}
					{optionList.length === 0 && (
						<li className="px-3 py-2.5 text-text-muted" role="presentation">
							{emptyLabel}
						</li>
					)}
				</ul>
			)}
		</div>
	);
};
