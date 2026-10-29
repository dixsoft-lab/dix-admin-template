import {
	type CSSProperties,
	type ReactNode,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

export type ChipInputOptionListProps = {
	readonly anchorId: string;
	readonly id: string;
	readonly label: string;
	readonly header: ReactNode;
	readonly children: ReactNode;
};

export const ChipInputOptionList = ({
	anchorId,
	id,
	label,
	header,
	children,
}: ChipInputOptionListProps) => {
	const listboxRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<CSSProperties | null>(null);

	useLayoutEffect(() => {
		const anchorElement = document.getElementById(anchorId);
		const listboxElement = listboxRef.current;
		if (!anchorElement || !listboxElement) return;

		const updatePosition = () => {
			const anchorRect = anchorElement.getBoundingClientRect();
			const viewportWidth =
				document.documentElement.clientWidth || window.innerWidth;
			const viewportHeight =
				window.visualViewport?.height || window.innerHeight;
			const width = Math.max(
				1,
				Math.min(320, anchorRect.width || 320, viewportWidth - 16),
			);
			const left = Math.min(
				Math.max(8, anchorRect.left),
				Math.max(8, viewportWidth - width - 8),
			);
			const gap = 8;
			const spaceBelow = Math.max(
				0,
				viewportHeight - anchorRect.bottom - gap - 8,
			);
			const spaceAbove = Math.max(0, anchorRect.top - gap - 8);
			const expectedHeight = Math.min(listboxElement.scrollHeight, 288);
			const opensAbove = spaceBelow < expectedHeight && spaceAbove > spaceBelow;
			const availableHeight = opensAbove ? spaceAbove : spaceBelow;
			const maxHeight = Math.max(80, Math.min(288, availableHeight));
			const height = Math.min(listboxElement.scrollHeight, maxHeight);
			const top = opensAbove
				? Math.max(8, anchorRect.top - gap - height)
				: anchorRect.bottom + gap;

			setPosition({
				position: "fixed",
				left,
				top,
				width,
				maxHeight,
				visibility:
					anchorRect.bottom >= 0 && anchorRect.top <= viewportHeight
						? "visible"
						: "hidden",
			});
		};

		updatePosition();
		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(updatePosition);
		resizeObserver?.observe(anchorElement);
		resizeObserver?.observe(listboxElement);
		document.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);
		window.visualViewport?.addEventListener("resize", updatePosition);
		window.visualViewport?.addEventListener("scroll", updatePosition);

		return () => {
			resizeObserver?.disconnect();
			document.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
			window.visualViewport?.removeEventListener("resize", updatePosition);
			window.visualViewport?.removeEventListener("scroll", updatePosition);
		};
	}, [anchorId]);

	if (typeof document === "undefined") return null;
	const portalRoot =
		document.querySelector<HTMLElement>("[data-theme-root]") ?? document.body;
	return createPortal(
		<div
			aria-label={label}
			className="
     fixed z-50 max-h-72 max-w-[calc(100vw-16px)]
     overflow-y-auto rounded-md border border-solid
     border-primary bg-surface shadow-[0_2px_8px_rgb(26_26_26/8%)]
   "
			id={id}
			ref={listboxRef}
			role="listbox"
			style={position ?? { visibility: "hidden" }}
		>
			<div
				className="
      border-b border-solid border-border px-4
      py-2 text-caption text-text-muted
    "
			>
				{header}
			</div>
			{children}
		</div>,
		portalRoot,
	);
};
