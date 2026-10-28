import { useId, useState, type KeyboardEvent } from "react";
import { Input } from "@admin/shared/design-system";

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
		<div className="dix-combobox">
			<label htmlFor={inputId}>{label}</label>
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
					className="dix-combobox-list"
				>
					{optionList.map((option, index) => (
						<li
							key={option.value}
							id={listId + "-" + index}
							role="option"
							aria-selected={option.value === value}
							aria-disabled={option.disabled || undefined}
							data-active={index === activeIndex || undefined}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => select(option)}
						>
							{option.label}
						</li>
					))}
					{optionList.length === 0 && <li role="presentation">{emptyLabel}</li>}
				</ul>
			)}
		</div>
	);
};
