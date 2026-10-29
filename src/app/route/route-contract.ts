import type { ReactElement } from "react";
import type { BreadcrumbState } from "@/component/ui/breadcrumb/breadcrumb-context";

export type RouteElementMap = {
	readonly shell: ReactElement;
	readonly login: ReactElement;
	readonly overview: ReactElement;
	readonly list: ReactElement;
	readonly create: ReactElement;
	/** 선택적 로컬 demo route입니다. 소비 제품의 결제 route를 대신하지 않습니다. */
	readonly payment?: ReactElement;
	/** 선택적 로컬 demo route입니다. 소비 제품의 편집 화면을 대신하지 않습니다. */
	readonly editorExample?: ReactElement;
	readonly component: ReactElement;
	readonly detail: ReactElement;
	readonly analytics?: ReactElement;
	readonly detailAnalytics?: ReactElement;
	readonly contentList?: ReactElement;
	readonly contentCreate?: ReactElement;
	readonly contentEditor?: ReactElement;
	readonly commentQueue?: ReactElement;
	readonly accountList?: ReactElement;
	readonly accountCreate?: ReactElement;
	readonly accountAccessDenied?: ReactElement;
	readonly approval?: ReactElement;
	readonly notFound: ReactElement;
};

export type RouterOptions = {
	readonly basename?: string;
};

export type RoutePresentation = {
	readonly title: string;
	readonly breadcrumb: BreadcrumbState;
};
