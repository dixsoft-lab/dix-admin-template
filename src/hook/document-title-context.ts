import { createContext } from "react";

export type DocumentTitleContextValue = {
	readonly setTitle: (title: string | null) => void;
};

export const DocumentTitleContext =
	createContext<DocumentTitleContextValue | null>(null);
