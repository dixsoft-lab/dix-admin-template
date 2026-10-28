# Consumer 설정과 기능 확장

`dix-admin-template`은 React 19 Admin 앱의 시작 소스다. Consumer(소비 프로젝트)가 제품 인증, 권한, 데이터와 Business Logic(비즈니스 로직)을 구현하고, template의 shell·UI·Hook·명시적 Router를 사용한다. 개발 demo는 메모리에서만 동작하며 production용 인증 구현이 아니다.

## Standalone 시작

독립 저장소에서는 앱 root의 `package.json`, `package-lock.json`, `node_modules`를 함께 관리한다. Node 20.19.0 이상과 npm 10.8.0 이상이 필요하다. clone한 저장소 root에서 다음 명령을 실행한다.

<!-- consumer-command: standalone -->

```sh
npm ci
npm run typecheck
npm run build
```

`npm run dev`로 개발 demo를 연다. Production build에는 demo가 포함되지 않으며, [App](../../src/app/App.tsx)에 `consumer`를 주입하지 않은 상태는 설정 오류 화면을 보여준다. 아래 조립 예제를 연결한 뒤 실제 프로젝트의 로그인·로그아웃·세션 상태를 구현한다.

## Monorepo workspace로 배치

앱 소스와 Vite·TypeScript 설정을 `apps/admin/`에 둔다. `.git`, `node_modules`, `dist`, 비밀 환경 파일은 복사하지 않는다. 검증된 fixture는 dependency와 lockfile을 parent root가 소유하며, 앱 manifest는 고유 workspace 이름과 실행 script를 소유한다.

1. Parent `package.json`의 `workspaces`에 `apps/admin`과 필요한 `packages/*`를 등록한다.
2. Template의 runtime·dev dependency를 parent manifest에 병합한다. 이미 사용 중인 버전과 peer dependency를 대조한다.
3. 앱의 중첩 `package-lock.json`을 두지 않고 parent에서 `npm install`로 단일 lockfile을 갱신한다. 기존 consumer lockfile을 template lockfile로 덮어쓰지 않는다.
4. [Parent manifest](../../fixtures/consumer-monorepo/package.json)와 [앱 manifest](../../fixtures/consumer-monorepo/apps/admin/package.json)를 참고한다. 아래 명령의 `dix-admin-consumer`는 이 fixture의 workspace 이름이며 실제 앱 이름에 맞춘다.

<!-- consumer-command: workspace -->

```sh
npm ci
npm run typecheck --workspace=dix-admin-consumer
npm run build --workspace=dix-admin-consumer
```

[Build 설정](../../scripts/app-build-config.mjs)은 실행한 shell의 cwd와 관계없이 앱 root를 기준으로 경로를 해석한다.

| 설정              | 기본값         | Workspace 예시       |
| ----------------- | -------------- | -------------------- |
| `ADMIN_BASE_PATH` | `/`            | `/admin/`            |
| `ADMIN_ENV_DIR`   | 앱 root `.`    | `../../config/admin` |
| `ADMIN_OUT_DIR`   | 앱 root `dist` | `../../output/admin` |

```sh
ADMIN_BASE_PATH=/admin/ ADMIN_ENV_DIR=../../config/admin ADMIN_OUT_DIR=../../output/admin npm run build --workspace=dix-admin-consumer
```

실제 Hosting의 SPA fallback은 선택한 base 아래의 앱 HTML로 연결한다. Vite base 설정만으로 서버 rewrite나 접근 권한이 구성되지는 않는다. `VITE_` 환경 값은 client bundle에 들어가므로 비밀 값을 넣지 않는다.

## Design-system provider 선택

앱 코드는 [design-system 공개 API](../../src/shared/design-system/index.ts)를 사용한다. `DesignSystemProvider`에 `selection`을 전달하면 해당 subtree의 Button·Input·Badge·Skeleton 구현을 선택한다. [Component/type 계약](../../src/shared/design-system/design-system-contract.ts)을 외부 package와 workspace package가 동일하게 구현해야 한다. CSS는 component import와 별도로 import한다.

| Mode        | 소스 위치·설치                    | 연결                                         |
| ----------- | --------------------------------- | -------------------------------------------- |
| `embedded`  | 앱 내부 source                    | 기본 primitive 사용                          |
| `workspace` | parent의 `packages/design-system` | npm workspace package import와 component map |
| `external`  | 회사의 versioned package          | 설치한 package import와 component map        |

다음 세 블록은 각각 `src/app/provider.ts`로 저장할 수 있는 선택 예제다. `dix-admin-fixture-provider`는 이 저장소의 [검증 전용 package](../../src/shared/design-system/fixture/provider-package/package.json)이며 회사에서 배포한 package가 아니다. 실제 프로젝트에서는 설치한 package 이름으로 import를 바꾸고, dependency를 소유하는 manifest와 lockfile을 함께 갱신한다. Workspace 연결은 npm workspace 등록과 package 이름으로 해석되며, source의 상대 경로를 직접 import하지 않는다.

<!-- consumer-example: provider-embedded -->

```ts
import type { DesignSystemSelection } from "@admin/shared/design-system";

export const selection = {
	mode: "embedded",
} satisfies DesignSystemSelection;
```

<!-- consumer-example: provider-workspace -->

```ts
import * as component from "dix-admin-fixture-provider";
import "dix-admin-fixture-provider/styles.css";
import type { DesignSystemSelection } from "@admin/shared/design-system";

export const selection = {
	mode: "workspace",
	component,
} satisfies DesignSystemSelection;
```

<!-- consumer-example: provider-external -->

```ts
import * as component from "dix-admin-fixture-provider";
import "dix-admin-fixture-provider/styles.css";
import type { DesignSystemSelection } from "@admin/shared/design-system";

export const selection = {
	mode: "external",
	component,
} satisfies DesignSystemSelection;
```

`Button`, `Input`, `Badge`, `Skeleton`의 JS export와 TypeScript declaration을 모두 제공하고 React 19를 peer dependency로 선언한다. 외부 package 설치·인증·버전 배포는 consumer가 선택한 registry의 책임이다. Template은 특정 회사 package가 이미 publish됐다고 가정하지 않는다. `npm run verify:design-system-modes`는 provider 계약과 React 없는 CSS consumer를, `npm run verify:consumer-modes`는 실제 workspace symlink와 packed tarball 설치를 검사한다.

## Framework-neutral CSS와 theme

React component source는 React 앱에서 사용한다. [tokens.css](../../src/shared/design-system/tokens.css)와 [styles.css](../../src/shared/design-system/styles.css)는 React import가 없는 plain CSS entry다. 다른 framework는 이 CSS 파일을 자체 asset에 복사하거나 design-system package의 독립 CSS subpath로 제공해 import할 수 있다. 현재 앱 저장소 자체를 npm package로 publish하는 계약은 없다.

CSS-only 소비자는 `.dix-admin-theme` 아래에서 `--dix-admin-*` semantic custom property를 사용한다. `styles.css`는 token과 embedded primitive CSS를 함께 포함한다. 파일을 옮길 때 상대 `@import` 대상도 함께 옮기거나 CSS를 bundle한다. 단일 token 파일만 필요하면 `tokens.css`를 소비한다.

```html
<link rel="stylesheet" href="./tokens.css" />
<main class="dix-admin-theme">
	<p style="color: var(--dix-admin-color-text)">프로젝트 화면</p>
</main>
```

Brand의 `token`은 theme root에 적용된다. Overlay는 같은 theme root 내부의 `OverlayProvider` 아래에 두어 modal·toast가 해당 token을 상속하게 한다. Consumer의 전역 CSS reset·PurgeCSS·CSS extraction 도구가 `.dix-admin-*` selector를 제거하지 않는지도 확인한다.

## Auth·Permission·Navigation·Brand 조립

[AuthAdapter](../../src/feature/auth/model/auth-adapter.ts)는 `loading`, `anonymous`, `authenticated`, `error`와 `login`·`logout` 명령을 제공한다. Consumer는 세션 구독과 명령 상태를 React state에 연결하고, 상태가 바뀌면 새 runtime을 전달한다. `isActionPending`은 로그인·로그아웃의 UI 중복 동작을 막는 표시다.

[PermissionAdapter](../../src/entity/current-account/model/permission.ts)는 `capabilityList`와 `allows`를 제공한다. 알려지지 않은 capability는 `allows`의 결과와 관계없이 거부된다. [NavigationItem·AdminBrand](../../src/widget/sidebar/model/sidebar-contract.ts)는 path·label·icon·badge·capability, title·logo·token을 정의한다. Menu 숨김은 server authorization을 대신하지 않는다.

각 page의 capability 접근 제한은 consumer가 [CapabilityBoundary](../../src/app/guard/CapabilityBoundary.tsx) 등으로 연결한다. Sidebar에 capability를 지정하는 것만으로 직접 URL 접근이 제한되지는 않는다. Shell 밖의 공개 login·system page는 자체 `.dix-admin-theme` root를 두어 UI token을 적용한다.

다음 코드를 `src/app/ConsumerApp.tsx`에 둔다. `runtime`은 실제 consumer 상태이고, `page`는 소비 프로젝트의 page element를 연결한 안정적인 객체다. `page` 객체를 매 render마다 새로 만들면 Router가 재생성되므로 module scope 또는 `useMemo`로 수명을 유지한다.

<!-- consumer-example: consumer-app -->

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import {
	Link,
	Outlet,
	RouterProvider,
	useLocation,
	useNavigate,
} from "react-router-dom";
import type { AuthAdapter } from "@admin/feature/auth";
import type { PermissionAdapter } from "@admin/entity/current-account";
import type { AdminBrand, NavigationItem } from "@admin/widget/sidebar";
import {
	DesignSystemProvider,
	type DesignSystemSelection,
} from "@admin/shared/design-system";
import { Breadcrumb } from "@admin/shared/ui";
import { OverlayProvider } from "@admin/shared/overlay";
import { AdminShell } from "./layout/AdminShell";
import {
	AuthenticatedRoute,
	createAdminRouter,
	useAdminRoutePresentation,
	type AdminRouteElementMap,
} from "./route";

export type ConsumerRuntime = {
	readonly auth: AuthAdapter;
	readonly permission: PermissionAdapter;
	readonly brand: AdminBrand;
	readonly navigationList: readonly NavigationItem[];
};
type ConsumerAppProps = {
	readonly runtime: ConsumerRuntime;
	readonly page: Omit<AdminRouteElementMap, "shell">;
	readonly selection: DesignSystemSelection;
	readonly basename?: string;
};
const RuntimeContext = createContext<ConsumerRuntime | null>(null);
const ConsumerShell = () => {
	const runtime = useContext(RuntimeContext);
	const location = useLocation();
	const navigate = useNavigate();
	const presentation = useAdminRoutePresentation();
	if (!runtime) throw new Error("ConsumerRuntime이 필요합니다.");
	return (
		<AuthenticatedRoute auth={runtime.auth}>
			<AdminShell
				{...runtime}
				activePath={location.pathname}
				routeTitle={presentation.title}
				onNavigate={(path) => {
					void navigate(path);
				}}
			>
				<OverlayProvider>
					<Breadcrumb
						state={presentation.breadcrumb}
						renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
					/>
					<Outlet />
				</OverlayProvider>
			</AdminShell>
		</AuthenticatedRoute>
	);
};
export const ConsumerApp = ({
	runtime,
	page,
	selection,
	basename = import.meta.env.BASE_URL,
}: ConsumerAppProps) => {
	const [router, setRouter] = useState<ReturnType<
		typeof createAdminRouter
	> | null>(null);
	useEffect(() => {
		const instance = createAdminRouter(
			{ ...page, shell: <ConsumerShell /> },
			{ basename },
		);
		setRouter(instance);
		return () => instance.dispose();
	}, [page, basename]);
	return (
		<DesignSystemProvider selection={selection}>
			<RuntimeContext value={runtime}>
				{router && <RouterProvider router={router} />}
			</RuntimeContext>
		</DesignSystemProvider>
	);
};
```

실제 `src/main.tsx`에서는 consumer의 reactive runtime Hook과 page map을 사용한 component를 만들고 `<App consumer={Consumer} />`로 mount한다. App이 공통 CSS를 import한다. `AuthAdapter.login/logout`에 비동기 명령을 연결할 때 명령 결과·오류·pending 상태는 consumer의 Mutation 경계가 소유한다. 이 문서 검증은 anonymous adapter를 주입한 임시 build fixture를 사용하며 실제 인증을 검증하지 않는다.

## Route와 basename 확장

[route-paths.ts](../../src/shared/routing/route-paths.ts)의 `adminRoutePath`는 `/item`처럼 app-local path를 소유하고 `adminRouterBasename`은 별도 `/` 기본값을 갖는다. 동적 URL은 `adminRoutePath.detail(itemId)`의 `generatePath` builder로 만든다. [router.tsx](../../src/app/route/router.tsx)의 `createRoutesFromElements`에 실제 page/system element와 handle을 명시 등록한다. 상수 추가만으로 route가 등록되지는 않는다.

새 route는 path·필요한 builder, route element map, 명시적 Route, [route handle](../../src/app/route/route-handle.ts), navigation·redirect 사용처를 함께 수정한다. `basename=/admin`을 path object에 합치지 않는다. Vite `ADMIN_BASE_PATH`와 Router에 전달하는 `import.meta.env.BASE_URL`을 맞추면 일반 클릭·직접 URL·새 탭 href가 같은 mount 경로를 사용한다. Navigation callback은 계속 app-local path를 받는다.

```ts
import { adminRoutePath } from "@admin/shared/routing";

const detailUrl = adminRoutePath.detail("entry-7");
const navigationList = [{ path: adminRoutePath.list, label: "항목" }];
```

`npm run verify:template-routes`로 미등록 path·중복 raw path·basename 혼입을 검사하고, root와 변경한 basename에서 refresh·redirect·breadcrumb·직접 URL을 실제 브라우저로 확인한다.

## Feature와 데이터 흐름

FSD(Feature-Sliced Design)의 의존 방향은 `app → page → widget → feature → entity → shared`다. App은 Provider·Router·adapter를 조립하고, Page는 화면을 조립한다. 독립 사용자 과업과 Business Logic은 Feature, 재사용하는 Domain(도메인) 데이터 모델은 Entity가 소유한다. Shared에는 특정 제품 모델·API 응답을 넣지 않는다. 같은 layer의 다른 slice를 직접 참조하지 않고 slice 외부에는 `index.ts` 공개 API를 사용한다.

| 책임                                       | Consumer가 추가할 위치 예시                                       |
| ------------------------------------------ | ----------------------------------------------------------------- |
| 요청·응답 schema, API 호출, 화면 모델 변환 | `feature/<domain>/api/` 또는 책임을 소유한 `entity/<domain>/api/` |
| Query key·조회 Hook·캐시 정책              | 소유 slice의 `query/`                                             |
| 생성·변경·삭제·업로드 명령과 invalidation  | 소유 slice의 `mutation/`                                          |
| 여러 명령을 조합하는 Business Logic        | 소유 slice의 `model/`                                             |
| 재사용 UI와 interaction Hook               | `shared/ui/`, `shared/lib/`                                       |
| 공통 API transport·QueryClient 설정        | 필요해질 때 `shared/api/`, `shared/query/`                        |

데이터 흐름은 `UI → Query/Mutation Hook → Domain API → transport → backend`다. API는 외부 응답을 Validation Schema(검증 스키마)로 검증한 뒤 요청 대상 일치 확인과 화면 모델 변환을 수행한다. 조회는 Query, 사용자 변경 명령은 Mutation으로 연결한다. Template에는 Query·schema·backend library가 설치되어 있지 않으므로 consumer가 선택·설치하고 spec과 lockfile을 갱신한다. 이름만 있는 빈 layer·slice를 미리 만들지 않는다.

Query key에는 결과를 바꾸는 세션·식별자·filter를 포함하고, logout·권한 변경 뒤 cache와 늦은 응답 처리 정책을 정한다. UI는 pending·error·empty를 props로 받도록 유지한다. 서버는 요청마다 인증·권한·자원 소유권을 판정해야 하며, capability menu와 client route guard는 그 판정의 대체 수단이 아니다.

## Demo에서 production으로 전환

1. Consumer의 실제 세션·권한·brand·navigation adapter와 page map을 만든다.
2. 실제 runtime을 구독하는 component를 `App.consumer`에 주입한다. Demo의 fake auth·샘플 데이터·timer를 제품 API로 재사용하지 않는다.
3. `loading/anonymous/authenticated/error`, unknown capability deny, login/logout pending과 오류를 검증한다.
4. Consumer-owned API/schema/Query/Mutation을 연결하고 서버 authorization과 함께 검증한다.
5. Production build를 실행해 설정 오류 화면이 사라지고 실제 consumer가 mount되는지 확인한다. Development demo가 production 산출물에 없다는 검사는 실제 consumer 기능 검증을 대신하지 않는다.

## 검증과 증거

`node scripts/verify-consumer-docs.mjs`는 이 문서의 링크·필수 절과 표시된 TypeScript 예제를 검사한다. 문서 코드 블록을 실제 source로 추출해 clean standalone external-package 및 parent-workspace consumer에서 `npm ci`, typecheck, production build를 실행한다. Embedded selection도 함께 typecheck한다. 잘못된 link와 provider example은 각각 `--fixture=broken-link`, `--fixture=invalid-provider-example`로 exit 1을 확인한다.

`npm run verify:consumer-modes`는 standalone embedded/external과 monorepo embedded/workspace/external 다섯 조합을 검사한다. `npm run verify:template-fsd`, `npm run verify:template-routes`, `npm run verify:template-domain-boundary`도 실행한다. Consumer가 자체 Domain과 backend를 추가하면 template 원본의 Domain 누수 금지 목록과 consumer의 허용 경계를 명시적으로 조정하고, FSD·route·provider 계약은 유지한다.

이 명령들은 install·typecheck·build·source 계약의 증거다. 실제 브라우저의 modal focus·keyboard·responsive·네트워크 요청과 backend 권한 검증은 각각 별도 관측 결과로 기록한다. 실행하지 않은 검증이나 아직 생성되지 않은 GitHub Actions 결과를 통과로 기록하지 않는다.
