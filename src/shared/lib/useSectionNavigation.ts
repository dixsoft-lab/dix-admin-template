import { useEffect, useState } from "react";

type SectionNavigationOption = {
	readonly sectionIdList: readonly string[];
	readonly offset?: number;
	readonly isReady?: boolean;
};

export const useSectionNavigation = ({
	sectionIdList,
	offset = 0,
	isReady = true,
}: SectionNavigationOption) => {
	const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
	useEffect(() => {
		if (!isReady) return;
		const sectionList = sectionIdList.flatMap((id) => {
			const element = document.getElementById(id);
			return element === null ? [] : [{ id, element }];
		});
		let frameId: number | null = null;
		const updateSection = () => {
			frameId = null;
			const atBottom =
				window.scrollY > 0 &&
				document.documentElement.scrollHeight -
					window.innerHeight -
					window.scrollY <=
					2;
			if (atBottom) {
				setActiveSectionId(sectionList.at(-1)?.id ?? null);
				return;
			}
			let nextId = sectionList[0]?.id ?? null;
			for (const section of sectionList) {
				if (section.element.getBoundingClientRect().top > offset + 16) break;
				nextId = section.id;
			}
			setActiveSectionId(nextId);
		};
		const scheduleUpdate = () => {
			if (frameId === null)
				frameId = window.requestAnimationFrame(updateSection);
		};
		const observer = new ResizeObserver(scheduleUpdate);
		for (const section of sectionList) observer.observe(section.element);
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);
		updateSection();
		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
			if (frameId !== null) window.cancelAnimationFrame(frameId);
		};
	}, [sectionIdList, offset, isReady]);

	const navigateToSection = (id: string) => {
		if (!sectionIdList.includes(id)) return;
		const element = document.getElementById(id);
		if (element === null) return;
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		window.scrollTo({
			top: window.scrollY + element.getBoundingClientRect().top - offset,
			behavior: reducedMotion ? "instant" : "smooth",
		});
	};
	return { activeSectionId, navigateToSection };
};
