import { useMemo } from "react";

type SelectionOption<Key extends string> = {
	readonly keyList: readonly Key[];
	readonly selectedKeyList: readonly Key[];
	readonly onChange: (keyList: readonly Key[]) => void;
};

export const useSelection = <Key extends string>({
	keyList,
	selectedKeyList,
	onChange,
}: SelectionOption<Key>) => {
	const selectedKeySet = useMemo(
		() => new Set(selectedKeyList),
		[selectedKeyList],
	);
	const isAllSelected =
		keyList.length > 0 && keyList.every((key) => selectedKeySet.has(key));
	const isPartlySelected =
		!isAllSelected && keyList.some((key) => selectedKeySet.has(key));
	const toggle = (key: Key) => {
		const nextKeySet = new Set(selectedKeySet);
		if (nextKeySet.has(key)) nextKeySet.delete(key);
		else nextKeySet.add(key);
		onChange([...nextKeySet]);
	};
	const toggleAll = () => {
		if (keyList.length === 0) return;
		const nextKeySet = new Set(selectedKeySet);
		for (const key of keyList) {
			if (isAllSelected) nextKeySet.delete(key);
			else nextKeySet.add(key);
		}
		onChange([...nextKeySet]);
	};
	return { selectedKeySet, isAllSelected, isPartlySelected, toggle, toggleAll };
};
