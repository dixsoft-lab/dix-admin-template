import type { DesignSystemComponentMap } from "../design-system-contract";
import { EmbeddedBadge } from "./EmbeddedBadge";
import { EmbeddedButton } from "./EmbeddedButton";
import { EmbeddedInput } from "./EmbeddedInput";
import { EmbeddedSkeleton } from "./EmbeddedSkeleton";

export const embeddedDesignSystem = {
	Button: EmbeddedButton,
	Input: EmbeddedInput,
	Badge: EmbeddedBadge,
	Skeleton: EmbeddedSkeleton,
} as const satisfies DesignSystemComponentMap;
