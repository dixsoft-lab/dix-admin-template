import type { CSSProperties } from "react";
import type { SkeletonProps } from "../design-system-contract";

type SkeletonStyle = CSSProperties & {
	readonly "--animation-delay"?: string;
};

const shapeClassNameByShape = {
	line: "h-[1em]",
	block: "min-h-24",
	circle: "size-10 rounded-full",
	bar: "h-2",
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
			className={`block w-full animate-skeleton rounded-sm bg-surface-muted [animation-delay:var(--animation-delay,0ms)] motion-reduce:animate-none ${shapeClassNameByShape[shape]} ${className}`}
			style={style}
		/>
	);
};
