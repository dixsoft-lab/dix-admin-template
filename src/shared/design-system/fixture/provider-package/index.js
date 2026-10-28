import { createElement } from "react";

export const Button = ({ variant = "primary", type = "button", ...props }) =>
	createElement("button", {
		...props,
		type,
		"data-provider": "fixture",
		"data-variant": variant,
	});

export const Input = (props) =>
	createElement("input", { ...props, "data-provider": "fixture" });

export const Badge = ({ tone = "neutral", ...props }) =>
	createElement("span", {
		...props,
		"data-provider": "fixture",
		"data-tone": tone,
	});

export const Skeleton = ({ shape = "line", className }) =>
	createElement("span", {
		className,
		"data-provider": "fixture",
		"data-shape": shape,
		"aria-hidden": true,
	});
