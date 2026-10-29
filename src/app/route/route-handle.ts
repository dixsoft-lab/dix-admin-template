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
	payment: {
		title: "Payment",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "Payment" }],
		},
	},
	component: {
		title: "공통 컴포넌트",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "공통 컴포넌트" }],
		},
	},
	analytics: {
		title: "리포트",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "리포트" }],
		},
	},
	detailAnalytics: {
		title: "유저스토리 리포트",
		breadcrumb: {
			kind: "trail",
			itemList: [
				overviewCrumb,
				{ label: "리포트", to: routePath.analytics("stories") },
				{ label: "상세" },
			],
		},
	},
	contentList: {
		title: "유저스토리 관리",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "유저스토리 관리" }],
		},
	},
	contentCreate: {
		title: "신규 등록",
		breadcrumb: {
			kind: "trail",
			itemList: [
				overviewCrumb,
				{ label: "유저스토리 관리", to: routePath.contentList },
				{ label: "신규 등록" },
			],
		},
	},
	contentEdit: {
		title: "편집",
		breadcrumb: {
			kind: "trail",
			itemList: [
				overviewCrumb,
				{ label: "유저스토리 관리", to: routePath.contentList },
				{ label: "편집" },
			],
		},
	},
	commentQueue: {
		title: "모더레이션",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "모더레이션" }],
		},
	},
	accountList: {
		title: "계정 · 권한",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, { label: "계정 · 권한" }],
		},
	},
	accountCreate: {
		title: "담당자 계정 발급",
		breadcrumb: {
			kind: "trail",
			itemList: [
				overviewCrumb,
				{ label: "계정 · 권한", to: routePath.accountList },
				{ label: "담당자 계정 발급" },
			],
		},
	},
	accountAccessDenied: {
		title: "접근 권한 없음",
		breadcrumb: {
			kind: "trail",
			itemList: [
				overviewCrumb,
				{ label: "계정 · 권한", to: routePath.accountList },
				{ label: "접근 권한 없음" },
			],
		},
	},
	approval: {
		title: "스토리 검수",
		breadcrumb: {
			kind: "trail",
			itemList: [
				overviewCrumb,
				{ label: "유저스토리 관리", to: routePath.contentList },
				{ label: "검수" },
			],
		},
	},
	editorExample: {
		title: "항목 편집",
		breadcrumb: {
			kind: "trail",
			itemList: [overviewCrumb, listCrumb, { label: "편집" }],
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
