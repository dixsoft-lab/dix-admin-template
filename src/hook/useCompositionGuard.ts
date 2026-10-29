import { useRef, type KeyboardEvent } from "react";

export const useCompositionGuard = () => {
	const isCompositionActiveRef = useRef(false);
	const handleCompositionStart = () => {
		isCompositionActiveRef.current = true;
	};
	const handleCompositionEnd = () => {
		isCompositionActiveRef.current = false;
	};
	const isComposing = (event: KeyboardEvent<HTMLInputElement>) =>
		event.nativeEvent.isComposing ||
		event.nativeEvent.keyCode === 229 ||
		isCompositionActiveRef.current;

	return { handleCompositionStart, handleCompositionEnd, isComposing };
};
