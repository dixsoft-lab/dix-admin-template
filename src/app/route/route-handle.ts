import { routePath } from "@/route/route-paths";
import type { RoutePresentation } from "./route-contract";

const overviewCrumb = {
	label: "대시보드",
	to: routePath.overview,
} as const;
const listCrumb = { label: "목록", to: routePath.list } as const;

export const routeHandle = {
	root: {
		title: "관리",
		breadcrumb: { kind: "trail", itemList: [overviewCrumb] },
	},
	login: {
		title: "로그인",
		breadcrumb: { kind: "trail", itemList: [{ label: "로그인" }] },
	},
	overview: {
		title: "대시보드",
		breadcrumb: { kind: "trail", itemList: [{ label: "대시보드" }] },
	},
	list: {
		title: "목록",
		breadcrumb: { kind: "trail", itemList: [overviewCrumb, { label: "목록" }] },
	},
	create: {
		title: "새 항목",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, listCrumb, { label: "새 항목" }],
		},
	},
	component: {
		title: "공통 컴포넌트",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "공통 컴포넌트" }],
		},
	},
	detail: {
		title: "항목 상세",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, listCrumb, { label: "항목 상세" }],
		},
	},
	notFound: {
		title: "페이지를 찾을 수 없습니다",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "페이지를 찾을 수 없습니다" }],
		},
	},
} as const satisfies Record<string, RoutePresentation>;
