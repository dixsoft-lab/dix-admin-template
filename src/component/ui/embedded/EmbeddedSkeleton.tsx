import type { CSSProperties } from "react";
import type { SkeletonProps } from "../design-system-contract";

type SkeletonStyle = CSSProperties & {
	readonly "--animation-delay"?: string;
};

const shapeClassNameByShape = {
	line: "rounded-sm",
	block: "rounded-md",
	circle: "rounded-full",
	bar: "h-2 rounded-t-sm",
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
     relative isolate block overflow-hidden
     bg-skeleton
     ${shapeClassNameByShape[shape]} ${className}`}
			style={style}
		>
			<span
				className="
      pointer-events-none absolute inset-y-0 left-0
      w-[48%] bg-[linear-gradient(90deg,transparent,var(--color-skeleton-highlight),transparent)] animate-skeleton-shimmer [animation-delay:var(--animation-delay,0ms)]
      motion-reduce:animate-none
    "
			/>
		</span>
	);
};
