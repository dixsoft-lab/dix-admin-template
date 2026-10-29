import type { CSSProperties, ReactNode } from "react";

export type ThemeStyle = CSSProperties & {
	readonly [token: `--${string}`]: string | number | undefined;
};

export type Brand = {
	readonly title: string;
	readonly logo?: ReactNode;
	readonly token?: ThemeStyle;
};

export type NavigationItem = {
	readonly path: string;
	readonly label: string;
	readonly icon?: ReactNode;
	readonly badge?: ReactNode;
	readonly capability?: string;
};

export type Navigate = (path: string) => void;
