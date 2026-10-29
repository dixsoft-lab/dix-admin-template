import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

import { setDocumentTitle } from "@/hook/document-title";
import { DocumentTitleContext } from "@/hook/document-title-context";

type DocumentTitleProps = {
	readonly children: ReactNode;
	readonly path: string;
	readonly title: string;
};

type DocumentTitleOverride = {
	readonly path: string;
	readonly title: string;
} | null;

export const DocumentTitle = ({
	children,
	path,
	title,
}: DocumentTitleProps) => {
	const [override, setOverride] = useState<DocumentTitleOverride>(null);
	const setTitle = useCallback(
		(nextTitle: string | null) => {
			setOverride(nextTitle === null ? null : { path, title: nextTitle });
		},
		[path],
	);
	const context = useMemo(() => ({ setTitle }), [setTitle]);
	const resolvedTitle = override?.path === path ? override.title : title;

	useEffect(() => {
		setDocumentTitle(document, resolvedTitle);
	}, [resolvedTitle]);

	return (
		<DocumentTitleContext.Provider value={context}>
			{children}
		</DocumentTitleContext.Provider>
	);
};
