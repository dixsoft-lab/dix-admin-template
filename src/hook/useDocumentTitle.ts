import { useContext, useEffect } from "react";

import { setDocumentTitle } from "./document-title";
import { DocumentTitleContext } from "./document-title-context";

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
