# 소비 프로젝트 설정과 기능 확장

`dix-admin-template`은 여러 제품에서 재사용하는 React 19 app source입니다. 소비 프로젝트가 제품 auth·permission·navigation·brand adapter와 제품 기능·API를 연결하고, template의 Shell·route·공통 UI를 사용합니다. 개발 demo는 browser memory에서 동작하며 실제 인증이나 서버 authorization을 수행하지 않습니다.

## Project-local Agent Kit

Project-local 규칙이 필요할 때 [Agent Kit 설치 안내](agent-kit-installation.md)를 따릅니다. Skill 설치·갱신은 지정된 installer를 사용하고 기존 소비 프로젝트 규칙을 보존합니다.

## Standalone 시작

독립 저장소에서는 앱 root가 `package.json`, `package-lock.json`, `node_modules`를 관리합니다. Node.js `>=20.19.0`, npm `>=10.8.0` 환경을 사용합니다.

<!-- consumer-command: standalone -->

```sh
npm ci
npm run typecheck
npm run build
```

`npm run dev`로 local demo를 확인합니다. Production entry는 [`src/app/App.tsx`](../../src/app/App.tsx)의 `consumer`에 조립한 앱을 넣습니다. Consumer adapter가 없으면 설정 오류 화면이 표시됩니다.

## Monorepo workspace로 배치

앱 source와 Vite·TypeScript 설정을 `apps/admin/`에 둘 수 있습니다. Parent manifest가 dependency와 `package-lock.json`을 소유합니다. [`fixtures/consumer-monorepo/`](../../fixtures/consumer-monorepo/package.json)는 parent `workspaces`에 `apps/admin`과 `packages/*`를 포함한 예시입니다. 앱 전용 lockfile과 `node_modules`를 만들지 않습니다.

Parent root에서 실행합니다.

<!-- consumer-command: workspace -->

```sh
npm ci
npm run typecheck --workspace=dix-admin-consumer
npm run build --workspace=dix-admin-consumer
```

## Design-system provider 선택

[`DesignSystemProvider`](../../src/component/ui/DesignSystemProvider.tsx)는 `Button`, `Input`, `Badge`, `Skeleton` 네 primitive 구현을 선택합니다. 추가한 공통 UI는 [`src/component/ui/`](../../src/component/ui/AsyncState.tsx)의 개별 source를 직접 사용합니다. 모든 module import는 barrel 없이 구체 파일을 가리킵니다.

### Embedded provider

기본 구현을 사용하거나 앱 안에서 직접 수정하려면 아래 provider를 둡니다.

<!-- consumer-example: provider-embedded -->

```ts
import type { DesignSystemSelection } from "@/component/ui/design-system-contract";

export const selection: DesignSystemSelection = { mode: "embedded" };
```

### Workspace provider

같은 monorepo에서 component package를 연결합니다. Parent workspace package에 provider를 등록하고 소비 앱의 provider module에서 import합니다.

<!-- consumer-example: provider-workspace -->

```ts
import * as component from "dix-admin-fixture-provider";
import type { DesignSystemSelection } from "@/component/ui/design-system-contract";

export const selection: DesignSystemSelection = {
	mode: "workspace",
	component,
};
```

### External provider

Registry나 사내 package를 설치한 뒤 동일한 contract로 연결합니다. Provider는 Button·Input·Badge·Skeleton의 props와 semantic HTML을 보존해야 합니다.

<!-- consumer-example: provider-external -->

```ts
import * as component from "dix-admin-fixture-provider";
import type { DesignSystemSelection } from "@/component/ui/design-system-contract";

export const selection: DesignSystemSelection = { mode: "external", component };
```

## Tailwind CSS와 theme

Provider 구현이 Tailwind utility를 사용하면 소비 앱의 Tailwind 4 source 탐색에 workspace·설치 package source를 포함합니다. 이 저장소는 standalone CSS package를 제공하지 않습니다. Theme와 utilities는 소비 앱이 [`src/style/tailwind.css`](../../src/style/tailwind.css)를 구성해 생성합니다.

## Consumer app 조립 예제

아래 예제는 현재 route, Shell, breadcrumb, overlay, auth/permission adapter와 provider 계약으로 앱을 조립합니다. 실제 session·권한 판정·제품 route element는 소비 프로젝트의 구현으로 바꿉니다.

<!-- consumer-example: consumer-app -->

```tsx
import {
	Link,
	Outlet,
	RouterProvider,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { createRouter } from "@/app/route/router";
import type { RouteElementMap } from "@/app/route/route-contract";
import { useRoutePresentation } from "@/app/route/useRoutePresentation";
import type { AuthAdapter } from "@/contract/authentication/auth-adapter";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";
import { OverlayProvider } from "@/component/overlay/OverlayProvider";
import { BreadcrumbProvider } from "@/component/ui/breadcrumb/BreadcrumbProvider";
import { BreadcrumbSlot } from "@/component/ui/breadcrumb/BreadcrumbSlot";
import { DesignSystemProvider } from "@/component/ui/DesignSystemProvider";
import { Shell } from "@/layout/Shell";
import { routePath } from "@/route/route-paths";
import { selection } from "./provider";

const auth: AuthAdapter = {
	state: { kind: "authenticated", user: { displayName: "사용자" } },
	login: () => {},
	logout: () => {},
};
const permission: PermissionAdapter = {
	capabilityList: ["entry.read"],
	allows: (capability) => capability === "entry.read",
};
const ProjectLogo = () => (
	<svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
		<rect x="1" y="1" width="30" height="30" rx="9" className="fill-primary" />
		<path d="M9 8h7a8 8 0 0 1 0 16H9V8Z" className="fill-white" />
	</svg>
);
const brand: Brand = {
	title: "프로젝트 어드민",
	logo: <ProjectLogo />,
};
const navigationList: readonly NavigationItem[] = [
	{ path: routePath.overview, label: "개요" },
	{ path: routePath.list, label: "항목", capability: "entry.read" },
];

const ShellRoute = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const presentation = useRoutePresentation();
	return (
		<Shell
			auth={auth}
			permission={permission}
			brand={brand}
			navigationList={navigationList}
			activePath={location.pathname}
			routeTitle={presentation.title}
			onNavigate={(path) => void navigate(path)}
		>
			<OverlayProvider>
				<BreadcrumbProvider
					state={presentation.breadcrumb}
					renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
				>
					<BreadcrumbSlot />
					<Outlet />
				</BreadcrumbProvider>
			</OverlayProvider>
		</Shell>
	);
};

const element: RouteElementMap = {
	shell: <ShellRoute />,
	login: <h1 data-consumer-docs="consumer-docs-marker">로그인 연결 위치</h1>,
	overview: <h1>개요</h1>,
	list: <h1>목록</h1>,
	create: <h1>생성</h1>,
	component: <h1>공통 컴포넌트</h1>,
	detail: <h1>상세</h1>,
	notFound: <h1>페이지 없음</h1>,
};
const router = createRouter(element, { basename: import.meta.env.BASE_URL });

export const ConsumerApp = () => (
	<DesignSystemProvider selection={selection}>
		<RouterProvider router={router} />
	</DesignSystemProvider>
);
```

## Auth·Permission·Navigation·Brand 조립

[`AuthAdapter`](../../src/contract/authentication/auth-adapter.ts)는 `loading`, `anonymous`, `authenticated`, `error` 상태와 `login`, `logout`, 선택 `retry` callback을 전달합니다. 인증된 `user`는 Shell에 필요한 `displayName`과 선택 설명만 받습니다. 제품 account ID, profile schema, session storage는 consumer에서 관리합니다.

[`PermissionAdapter`](../../src/contract/authorization/permission-adapter.ts)는 등록 capability 목록과 `allows` 함수를 받습니다. 목록에 없는 capability는 항상 거부합니다. [`NavigationItem`과 `Brand`](../../src/contract/navigation/navigation-contract.ts)는 path, label, icon, badge, capability, title, logo, CSS variable을 전달합니다. 메뉴 숨김과 UI boundary는 backend authorization을 대신하지 않습니다.

브랜드 제목과 로고는 consumer의 `Brand`에서 교체합니다. 위 예제의 `ProjectLogo`처럼 프로젝트가 소유하는 SVG/React component를 `logo`에 전달하면 Sidebar 제목 왼쪽에 표시됩니다. Sidebar 하단은 사용자 이름·설명을 왼쪽에, 로그아웃 버튼을 오른쪽에 배치합니다. Demo의 [`DemoBrandLogo`](../../src/app/demo/DemoBrandLogo.tsx)는 모양을 바꿔 쓸 수 있는 예시입니다.

이미 등록된 화면을 메뉴에 노출하려면 소비 앱의 `navigationList`에 `{ path: routePath.list, label: "항목" }` 형태로 항목을 추가합니다. 새 화면까지 만들 때는 아래 항목을 함께 연결합니다.

1. `src/route/route-paths.ts`에 단수 route 상수를 추가합니다.
2. `src/app/route/route-contract.ts`의 `RouteElementMap`에 화면을 연결할 이름을 추가합니다.
3. `src/app/route/router.tsx`의 `createRouteList`에 명시적 `<Route>`를 추가하고 `src/app/route/route-handle.ts`에 제목·breadcrumb를 등록합니다.
4. 소비 앱의 route element map에 페이지를 연결한 다음, 소비 앱이 소유하는 `navigationList`에 path·label·필요한 `capability`를 추가합니다.

이 저장소의 `/component`와 `DemoComponentPage`는 위 연결의 예시입니다. 소비 프로젝트에서 제품 화면을 추가할 때는 제품 페이지를 소비 앱에 두고, 재사용할 route·layout·공통 UI만 template 계약에 반영합니다.

[`AuthBoundary`](../../src/component/authentication/AuthBoundary.tsx)는 adapter의 auth state를 표시하고, [`CapabilityBoundary`](../../src/component/authorization/CapabilityBoundary.tsx)는 화면 capability gate를 적용합니다. Shell 밖 login/system page도 `data-theme-root`와 필요한 token을 설정합니다.

## Route와 basename 확장

[`routePath`](../../src/route/route-paths.ts)는 앱 내부 경로를 관리합니다. [`createRouteList`](../../src/app/route/router.tsx)는 `RouteElementMap`의 각 element를 실제 route로 등록합니다. 새 route는 `routePath`, route element map, `createRouteList`, route metadata와 필요한 navigation을 함께 갱신합니다. Parameterized URL은 `generatePath`를 사용합니다.

Mount prefix는 router의 `basename`으로 분리합니다. `APP_BASE_PATH=/console/admin/`이면 동일 mount를 router 옵션으로 전달합니다. `vite.config.ts`의 `APP_BASE_PATH`, `APP_ENV_DIR`, `APP_OUT_DIR`는 앱 root 기준 경로를 사용하며 개발 `BASE_URL`은 DemoApp이 전달합니다.

## 제품 기능과 데이터 흐름

제품 page와 기능은 소비 프로젝트의 기존 구조에 둡니다. Template의 `component/ui`는 form 입력·loading·empty·error·pending·table 등 표현과 공통 interaction을 제공합니다. 소비 프로젝트는 `UI → Query/Mutation → Domain API → backend` 흐름에서 API schema 검증·응답 변환·cache 정책·업무 판단을 맡습니다.

## Demo에서 production으로 전환

`src/app/demo/`는 개발 서버에서만 동적으로 import됩니다. `App`에 consumer가 없으면 개발 모드에서는 demo를, production에서는 설정 오류를 표시합니다. 배포 전에 consumer component를 연결하고 실제 provider·auth·permission·navigation adapter를 구성합니다.

## 검증과 증거

`npm run verify:consumer-modes`는 standalone과 parent workspace에서 clean install·typecheck·build 및 provider contract 연결을 확인합니다. `npm run verify:consumer-docs`는 이 문서의 명령·예제·로컬 링크를 확인하고 standalone/workspace 조립 예제를 검증합니다. UI·keyboard·focus는 브라우저 확인 결과를 build와 별도로 기록합니다.
