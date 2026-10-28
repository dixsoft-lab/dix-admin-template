import type { CSSProperties, ReactNode } from "react";

export type AdminThemeStyle = CSSProperties & {
	readonly [token: `--dix-admin-${string}`]: string | number | undefined;
};

export type AdminBrand = {
	readonly title: string;
	readonly logo?: ReactNode;
	readonly token?: AdminThemeStyle;
};

export type NavigationItem = {
	readonly path: string;
	readonly label: string;
	readonly icon?: ReactNode;
	readonly badge?: ReactNode;
	readonly capability?: string;
};

export type Navigate = (path: string) => void;
