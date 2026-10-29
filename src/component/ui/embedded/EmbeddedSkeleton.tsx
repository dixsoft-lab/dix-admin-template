import type { CSSProperties } from "react";
import type { SkeletonProps } from "../design-system-contract";

type SkeletonStyle = CSSProperties & {
	readonly "--animation-delay"?: string;
};

const shapeClassNameByShape = {
	line: "rounded-sm",
	block: "rounded-md",
	circle: "rounded-full",
	bar: "h-2 origin-bottom rounded-t-sm animate-[skeleton-wave_1.25s_ease-in-out_infinite_alternate] [animation-delay:var(--animation-delay,0ms)]",
} as const;

export const EmbeddedSkeleton = ({
	className = "",
	shape = "line",
	animationDelay,
}: SkeletonProps) => {
	const style: SkeletonStyle = {
		"--animation-delay": `${animationDelay ?? 0}ms`,
	};

	return (
		<span
			aria-hidden="true"
			className={`
     relative isolate block w-full
     overflow-hidden bg-skeleton after:absolute after:inset-y-0
     after:left-0 after:w-[48%] after:translate-x-[-120%] after:bg-[linear-gradient(90deg,transparent,var(--color-skeleton-highlight),transparent)]
     after:content-[''] after:animate-skeleton-shimmer motion-reduce:animate-none motion-reduce:after:animate-none
     ${shapeClassNameByShape[shape]} ${className}`}
			style={style}
		/>
	);
};
