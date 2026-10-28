import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from "react";

export const Button: (
	props: ComponentPropsWithRef<"button"> & {
		readonly variant?: "primary" | "secondary" | "danger";
	},
) => ReactNode;
export const Input: (props: ComponentPropsWithRef<"input">) => ReactNode;
export const Badge: (
	props: HTMLAttributes<HTMLSpanElement> & {
		readonly tone?: "neutral" | "success" | "warning" | "danger";
	},
) => ReactNode;
export const Skeleton: (props: {
	readonly className?: string;
	readonly shape?: "line" | "block" | "circle" | "bar";
	readonly animationDelay?: number;
}) => ReactNode;
