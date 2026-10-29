import type {
	ComponentPropsWithRef,
	ComponentType,
	HTMLAttributes,
} from "react";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
	readonly variant?: "primary" | "secondary" | "danger";
};

export type InputProps = ComponentPropsWithRef<"input">;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	readonly tone?: "neutral" | "success" | "warning" | "danger";
};

export type SkeletonProps = {
	readonly className?: string;
	readonly shape?: "line" | "block" | "circle" | "bar";
	readonly animationDelay?: number;
};

export interface DesignSystemComponentMap {
	readonly Button: ComponentType<ButtonProps>;
	readonly Input: ComponentType<InputProps>;
	readonly Badge: ComponentType<BadgeProps>;
	readonly Skeleton: ComponentType<SkeletonProps>;
}

export type DesignSystemSelection =
	| { readonly mode: "embedded" }
	| {
			readonly mode: "workspace" | "external";
			readonly component: DesignSystemComponentMap;
	  };

export const designSystemExportNameList = [
	"Button",
	"Input",
	"Badge",
	"Skeleton",
] as const;
