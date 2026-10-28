import { useLayoutEffect, useRef, useState } from "react";

export const useStickyTableHeader = (headerHeight: number) => {
	const panelRef = useRef<HTMLDivElement>(null);
	const [isHeaderStuck, setIsHeaderStuck] = useState(false);

	useLayoutEffect(() => {
		const panel = panelRef.current;
		if (panel === null) return;
		let frameId: number | null = null;
		const updateStickyState = () => {
			frameId = null;
			const table = panel.querySelector("table");
			if (headerHeight <= 0 || table === null || table.offsetWidth === 0) {
				setIsHeaderStuck(false);
				return;
			}
			const bound = panel.getBoundingClientRect();
			const tableHeaderHeight = table.querySelector("thead")?.offsetHeight ?? 0;
			setIsHeaderStuck(
				bound.top + panel.clientTop <= headerHeight &&
					bound.bottom > headerHeight + tableHeaderHeight,
			);
		};
		const scheduleUpdate = () => {
			if (frameId === null)
				frameId = window.requestAnimationFrame(updateStickyState);
		};
		updateStickyState();
		const observer = new ResizeObserver(scheduleUpdate);
		observer.observe(panel);
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);
		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
			if (frameId !== null) window.cancelAnimationFrame(frameId);
		};
	}, [headerHeight]);

	return { panelRef, isHeaderStuck };
};
