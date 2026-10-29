import { useContext, useEffect } from "react";
import { DocumentTitleContext } from "./document-title-context";
import { setDocumentTitle } from "./document-title";

export const useDocumentTitle = (title: string): void => {
	const context = useContext(DocumentTitleContext);

	useEffect(() => {
		if (context === null) {
			setDocumentTitle(document, title);
			return;
		}

		context.setTitle(title);
		return () => context.setTitle(null);
	}, [context, title]);
};
