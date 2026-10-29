import type { CSSProperties } from "react";
import type { SkeletonProps } from "../design-system-contract";

type SkeletonStyle = CSSProperties & {
	readonly "--dix-admin-skeleton-delay"?: string;
};

export const EmbeddedSkeleton = ({
	className = "",
	shape = "line",
	animationDelay,
}: SkeletonProps) => {
	const style: SkeletonStyle = {
		"--dix-admin-skeleton-delay": `${animationDelay ?? 0}ms`,
	};

	return (
		<span
			aria-hidden="true"
			className={`dix-admin-skeleton dix-admin-skeleton--${shape} ${className}`}
			style={style}
		/>
	);
};
