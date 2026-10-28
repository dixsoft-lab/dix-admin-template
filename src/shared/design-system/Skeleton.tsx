import type { SkeletonProps } from "./design-system-contract";
import { useDesignSystem } from "./useDesignSystem";

export const Skeleton = (props: SkeletonProps) => {
	const Component = useDesignSystem().Skeleton;
	return <Component {...props} />;
};
