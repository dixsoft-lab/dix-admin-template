import { useLayoutEffect, useRef, useState } from "react";

export const useObservedElementHeight = <
	Element extends HTMLElement = HTMLDivElement,
>(
	isReady = true,
) => {
	const elementRef = useRef<Element>(null);
	const [elementHeight, setElementHeight] = useState(0);

	useLayoutEffect(() => {
		const element = elementRef.current;
		if (!isReady || element === null) return;
		const updateHeight = () =>
			setElementHeight(element.getBoundingClientRect().height);
		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		observer.observe(element);
		return () => observer.disconnect();
	}, [isReady]);

	return { elementRef, elementHeight };
};
