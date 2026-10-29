import { createElement } from "react";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";
import { routePath } from "@/route/route-paths";
import { DemoBrandLogo } from "./DemoBrandLogo";

export const demoPermission = {
	capabilityList: ["item.read", "item.create"],
	allows: (capability) =>
		capability === "item.read" || capability === "item.create",
} as const satisfies PermissionAdapter;

export const demoBrand = {
	title: "Dix Admin",
	logo: createElement(DemoBrandLogo),
} as const satisfies Brand;

export const demoNavigationList = [
	{ path: routePath.overview, label: "대시보드", section: "운영" },
	{ path: routePath.contentList, label: "유저스토리 관리", section: "운영" },
	{ path: routePath.commentQueue, label: "모더레이션", section: "운영" },
	{
		path: routePath.analytics("stories"),
		label: "유저스토리 목록",
		section: "리포트",
	},
	{
		path: routePath.analytics("engagement"),
		label: "참여 항목 응답률",
		section: "리포트",
	},
	{
		path: routePath.analytics("screens"),
		label: "화면별 도달률",
		section: "리포트",
	},
	{
		path: routePath.analytics("departments"),
		label: "부서별 활성률",
		section: "리포트",
	},
	{
		path: routePath.analytics("users"),
		label: "활동 사용자",
		section: "리포트",
	},
	{
		path: routePath.analytics("comments"),
		label: "인기 댓글",
		section: "리포트",
	},
	{
		path: routePath.detailAnalytics("H045"),
		label: "스토리 상세 리포트",
		section: "리포트",
	},
	{ path: routePath.contentCreate, label: "신규 등록", section: "유저스토리" },
	{
		path: routePath.content("H084"),
		label: "스토리 편집",
		section: "유저스토리",
	},
	{
		path: `${routePath.approval("H084")}?mode=submission`,
		label: "신규 검수 요청",
		section: "유저스토리",
	},
	{
		path: `${routePath.approval("H084")}?mode=version`,
		label: "업데이트 검수",
		section: "유저스토리",
	},
	{ path: routePath.accountList, label: "계정 목록", section: "계정 · 권한" },
	{
		path: routePath.accountCreate,
		label: "담당자 계정 발급",
		section: "계정 · 권한",
	},
	{
		path: routePath.accountAccessDenied,
		label: "접근 거부 화면",
		section: "계정 · 권한",
	},
	{
		path: routePath.list,
		label: "기본 목록 예시",
		capability: "item.read",
		section: "공통 예시",
	},
	{
		path: routePath.create,
		label: "기본 등록 예시",
		capability: "item.create",
		section: "공통 예시",
	},
	{
		path: routePath.payment("green-pasture"),
		label: "Payment",
		section: "공통 예시",
	},
	{
		path: routePath.editorExample("H084"),
		label: "편집기 예시",
		section: "공통 예시",
	},
	{ path: routePath.component, label: "공통 컴포넌트", section: "공통 예시" },
] as const satisfies readonly NavigationItem[];
