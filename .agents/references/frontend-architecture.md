# 프런트엔드 아키텍처

이 저장소는 여러 제품이 공통으로 쓸 수 있는 React 19 어드민 앱의 shell과 UI 기반을 제공합니다. 제품별 page·Domain·API·business rule은 소비 프로젝트의 architecture에 둡니다. 화면과 token의 규격은 [`DESIGN.md`](../../DESIGN.md), 검증 가능한 명령은 [`spec.md`](spec.md), 설치·조립은 [`consumer-guide.md`](consumer-guide.md)를 따릅니다.

## Source 지도

```text
src/
├── main.tsx                  # Vite bootstrap
├── app/                      # root 조립, /demo 전용 예시 앱, route/router
├── page/                     # route path를 반영한 화면 composition
│   ├── home/HomePage.tsx
│   ├── login/LoginPage.tsx
│   └── demo/                 # /demo 전용 route page와 예시 상태
├── layout/                   # Shell, Sidebar, Navigation
├── component/
│   ├── authentication/       # consumer auth 상태 경계
│   ├── authorization/        # consumer capability 경계
│   ├── metadata/             # 문서 제목 기본값과 페이지별 override
│   ├── overlay/              # modal·toast provider와 lifecycle
│   └── ui/                   # primitive facade, form/table/상태/breadcrumb
├── contract/                 # authentication, authorization, navigation 계약
├── hook/                     # 화면 간 interaction과 useDocumentTitle
├── route/                    # app-local path와 dynamic builder
└── style/tailwind.css        # Tailwind 진입점, theme token, 전역 keyframes
```

`component/ui`가 디자인 primitive와 조합형 UI의 공통 위치입니다. 별도 `design-system` source role은 없습니다. `layout` 자체가 앱 공통 shell/layout이므로 `layout/admin` 하위 폴더를 만들지 않습니다. 폴더와 소유 식별자는 단수형입니다. `src/**/index.ts` barrel도 두지 않습니다. Provider fixture의 `index.js`/`index.d.ts`는 테스트용 package의 실제 package entrypoint라 source barrel 규칙과 다릅니다.

## 역할과 의존 방향

상위 조립 역할인 `app`이 화면·layout·공통 기반을 연결합니다. 나머지 역할은 아래 방향을 지킵니다.

| 역할        | 허용 import 역할                                                           |
| ----------- | -------------------------------------------------------------------------- |
| `app`       | `app`, `page`, `layout`, `component`, `contract`, `hook`, `route`, `style` |
| `page`      | `component`, `contract`, `hook`, `route`, `style`                          |
| `layout`    | `component`, `contract`, `hook`, `route`, `style`                          |
| `component` | `component`, `contract`, `hook`, `route`, `style`                          |
| `contract`  | `contract`                                                                 |
| `hook`      | `contract`, `route`                                                        |
| `route`     | 내부 source import 없음                                                    |
| `style`     | TypeScript source import 없음                                              |

같은 module 내부 연결은 상대 경로를 씁니다. 다른 역할 또는 module을 참조할 때는 `@/` alias로 구체 source 파일을 지정합니다. 예: `@/component/ui/Button`, `@/contract/authentication/auth-adapter`, `@/layout/Shell`. directory import·`index.ts` 공개 barrel·역할 경계를 건너는 상대 경로는 사용하지 않습니다. `@/*`는 `src/*`를 가리키며 Vite·TypeScript·Vitest alias가 일치해야 합니다. `main.tsx`는 bootstrap 예외로 `@/app/App`만 연결합니다.

## Route page 폴더 구조

각 `Page` component는 실제 route와 관련된 폴더 하나에 둡니다. 한 폴더에는 route `Page` component를 하나만 두고, 같은 화면이 아닌 별도 화면은 각각의 route 폴더에 분리합니다. URL의 자원과 하위 route 관계를 디렉터리 깊이에 반영합니다.

```text
src/page/
├── home/
│   └── HomePage.tsx
├── login/
│   └── LoginPage.tsx
└── demo/
    ├── account/
    │   ├── DemoAccountListPage.tsx
    │   ├── access-denied/DemoAccountAccessDeniedPage.tsx
    │   └── new/DemoAccountCreatePage.tsx
    ├── component/DemoComponentPage.tsx
    ├── editor/DemoEditorPage.tsx
    ├── item/
    │   ├── DemoListPage.tsx
    │   ├── demo-record.ts
    │   ├── detail/DemoDetailPage.tsx
    │   └── new/DemoFormPage.tsx
    ├── login/DemoLoginPage.tsx
    ├── moderation/DemoModerationPage.tsx
    ├── not-found/DemoNotFoundPage.tsx
    ├── overview/DemoDashboardPage.tsx
    ├── payment/DemoPaymentPage.tsx
    ├── report/
    │   ├── DemoReportPage.tsx
    │   └── story/DemoStoryReportPage.tsx
    ├── review/DemoReviewPage.tsx
    ├── shared/useDemoLoading.ts
    ├── story/
    │   ├── DemoStoryListPage.tsx
    │   ├── detail/DemoStoryEditPage.tsx
    │   ├── new/DemoStoryCreatePage.tsx
    │   └── shared/StoryEditorView.tsx
    └── ...
```

예를 들어 `/item` 화면은 `page/demo/item/DemoListPage.tsx`, `/item/:itemId` 상세는 `page/demo/item/detail/DemoDetailPage.tsx`, `/item/new`은 `page/demo/item/new/DemoFormPage.tsx`에 둡니다. `page/demo/` 같은 route namespace는 자체 화면이 없는 한 Page component를 두지 않아도 됩니다. 여러 URL이 동일한 화면을 공유하면 한 Page에서 route parameter나 명시적 prop으로 상태를 구분할 수 있습니다. 공통 비화면 코드는 `shared/`나 소유 route module에 두고, `app`이 각 route와 Page를 연결합니다.

## Route 계약

Canonical route source는 [`src/route/route-paths.ts`](../../src/route/route-paths.ts), [`src/app/route/router.tsx`](../../src/app/route/router.tsx), [`route-handle.ts`](../../src/app/route/route-handle.ts)입니다. path 상수를 추가하는 것과 실제 Route 등록은 함께 이뤄져야 합니다.

1. `routePath`에 앱 내부 path를 선언합니다. Dynamic URL builder는 `generatePath(pattern, parameter)`를 사용합니다.
2. `RouteElementMap`에 소비자가 연결할 화면 element를 정의하고 `createRouteList`에서 명시적인 `<Route>`로 등록합니다.
3. `routeHandle`에 page title·breadcrumb metadata를 연결합니다. Navigation·redirect·guard도 같은 path 객체를 사용합니다.
4. `createRouter(element, { basename })`가 실제 browser router를 만듭니다. 배포 mount path는 app-local path와 별도 basename입니다.
5. 인증·capability 경계는 필요한 element에서 조립합니다. 메뉴 숨김만으로 URL 접근이 보호되지는 않습니다.

mount가 `/console/admin`이어도 내부 path는 `/item`이며 실제 URL은 `/console/admin/item`입니다. Router 내부 Navigation은 `useHref`로 anchor를 만들고 클릭 callback에는 app-local path를 전달합니다. Sidebar의 brand home link 목적지는 필수 `Shell.homePath` prop으로 지정하며 Router 내부에서는 Link가 basename을 적용합니다. Router 없는 Shell consumer는 `href`와 선택 `onNavigate` 동작을 사용합니다. Breadcrumb의 link 표현은 `renderLink`로 router `Link`를 주입할 수 있습니다.

`useRoutePresentation`은 현재 match의 handle에서 title·breadcrumb를 계산합니다. Route verifier는 path 등록, `generatePath`, basename 분리, route list 연결을 검사합니다.

## 페이지별 loading fallback

- 새 페이지에는 화면의 실제 배치와 데이터 모양을 반영하는 전용 skeleton component를 함께 둡니다. 이름은 예를 들어 `DemoPaymentPage.tsx`와 `DemoPaymentPageSkeleton.tsx`처럼 페이지 이름을 따릅니다. 공통 primitive는 `component/ui/Skeleton`을 사용하고, skeleton은 [DESIGN.md](../../DESIGN.md)의 접근성 규칙에 따라 장식으로 숨긴 뒤 부모에 `aria-busy`와 상태 안내를 둡니다.
- 페이지 module이 lazy-load되거나 data source가 Suspense 방식으로 대기할 때는 해당 Route element를 `<Suspense fallback={<DemoPaymentPageSkeleton />}>`로 감쌉니다. 경계는 `Shell` 안의 개별 page element에 둬 Sidebar·상단 frame이 유지되게 합니다. 앱 전체 경계는 페이지별 fallback을 대신하지 않습니다.
- 개발 Demo는 `/demo` 및 그 하위 경로에서만 열리며, 앱 root에서는 Demo 안내와 진입 링크를 보여줍니다. `App.tsx`의 `<Suspense fallback={null}>`는 development 전용 `DemoApp` module을 지연 로드합니다. 소비 프로젝트에서 Demo 검토를 마친 뒤 `npm run remove:demo`로 Demo page·runtime·전용 통합 테스트를 제거할 수 있습니다.
- Suspense는 `React.lazy` 또는 Suspense 호환 데이터 source가 suspend할 때만 작동합니다. 일반 `isLoading`·`isPending` boolean은 suspend하지 않으므로 `useDemoLoading` 같은 비-Suspense 경로에는 loading UI 분기가 필요합니다. 같은 page skeleton을 그 분기와 Suspense fallback에서 재사용하면 됩니다. Suspense 데이터 source를 쓰는 경로에는 중복 `isLoading` 분기를 만들지 않습니다.
- Consumer `AuthBoundary`의 loading·anonymous·error는 인증 상태이므로 page data skeleton으로 대체하지 않습니다. Page fallback은 해당 page module이나 page data의 대기만 표현합니다.
- Empty·error는 loading skeleton과 별도 상태로 표현합니다. 버튼 동작 대기는 페이지 전체 skeleton으로 바꾸지 않고 `PendingButton` 같은 action 상태를 사용합니다.

`layout/Shell`은 Breadcrumb와 route page를 최대 폭 제한 없이 가용 너비 전체(`w-full max-w-none`)를 쓰는 공통 본문 프레임 안에 왼쪽 정렬로 배치하고, `component/metadata/DocumentTitle`로 route·brand 기본 제목을 설정합니다. 4K를 포함한 넓은 화면에서 본문이 사이드바를 제외한 작업 영역 끝까지 확장됩니다. 모든 page는 이 너비와 Shell의 바깥 여백을 상속하므로 page root에 별도 최대 너비나 바깥 padding을 두지 않습니다. 폼·카드 등 개별 내부 영역의 읽기 너비는 page 안에서 정할 수 있습니다. 고정형 editor header도 좌우 inset을 사용해 공통 프레임에 맞춥니다. 페이지는 `hook/useDocumentTitle`로 제목을 재정의할 수 있으며, Shell 바깥 로그인 화면에서는 hook이 `document.title`을 직접 설정합니다.

## Design system과 Tailwind

[`src/style/tailwind.css`](../../src/style/tailwind.css)가 유일한 CSS 진입점입니다. Tailwind CSS 4 Vite plugin이 theme와 component `className`을 처리합니다. 모든 화면·공통 component 표현은 Tailwind utility class를 사용하고 component 인접 CSS 파일은 두지 않습니다. Global keyframes·theme token·`@source`는 진입점에만 둡니다.

`eslint.config.js`와 `eslint-plugin-better-tailwindcss`는 Tailwind class 줄바꿈만 검사합니다. Biome은 `biome.json`에서 import 정렬 규칙만 제공하며 package dependency나 실행 script는 두지 않습니다. 포맷은 `.prettierrc`와 Prettier가 담당합니다. 실제 설정은 [Tailwind source workflow](tailwind-source-workflow.md)를 따릅니다.

[`DesignSystemProvider`](../../src/component/ui/DesignSystemProvider.tsx)는 React subtree에 `embedded`, `workspace`, `external` 구현 중 하나를 선택합니다. 현재 primitive contract는 [`design-system-contract.ts`](../../src/component/ui/design-system-contract.ts)의 Button·Input·Badge·Skeleton 네 component입니다. Provider 교체는 이 네 component의 React 구현만 바꿉니다. 소비자가 workspace/external package를 쓸 때는 그 package source의 utility class가 Tailwind scan 대상에 포함되도록 consumer CSS를 설정합니다.

기본 token, 실제 primitive variant, 재사용 UI·overlay·shell 규격은 [`DESIGN.md`](../../DESIGN.md)에 정리되어 있습니다. Theme root는 `data-theme-root` attribute입니다. 소비자는 Navigation contract의 `Brand.token`으로 해당 root에서 CSS variable을 재정의합니다. `OverlayProvider`를 root 안에 배치하면 portal이 같은 theme를 상속합니다.

## Consumer adapter와 보안 경계

`contract/authentication`은 `AuthAdapter`, `AuthState`, `AuthenticatedUser` UI 계약입니다. `AuthenticatedUser`는 Shell에 표시할 이름과 선택 설명을 담으며 제품 account schema를 대체하지 않습니다. `AuthBoundary`와 `Shell`은 consumer가 전달한 loading·anonymous·authenticated·error 상태를 표시하고 login·logout·retry callback을 호출합니다.

`contract/authorization`의 `PermissionAdapter`는 capability 목록과 판정을 전달합니다. 등록되지 않은 capability는 기본 거부합니다. `CapabilityBoundary`와 Navigation은 consumer 판정을 화면에 반영할 뿐이며 backend authorization은 소비 제품이 구현해야 합니다. Template은 인증 provider, session storage, product role, endpoint를 소유하지 않습니다.

## 소비 기능과 데이터 흐름

소비 프로젝트는 제품 page·feature·Domain·API를 template source에 추가하지 않고 자체 architecture의 책임 위치에 둡니다. Template 공통 UI는 form 입력·pending·loading·empty·error 표시와 interaction을 담당합니다. 제품 판단과 요청은 소비 화면 및 해당 제품의 데이터 계층이 소유합니다.

소비 데이터 흐름의 일반 형태는 `UI → Query/Mutation → Domain API → backend`입니다. 조회는 Query, 변경·업로드·명령은 Mutation으로 연결합니다. 응답 검증·변환·cache key·invalidate는 해당 제품의 Domain 경계에서 정의합니다. 이 template은 Query·schema library나 backend SDK를 설치하지 않습니다.

## 변경 검증

역할 의존·import alias·barrel 금지 규칙은 `npm run verify:template-architecture`, route 변경은 `npm run verify:template-routes`, consumer contract는 `npm run verify:template-contracts`와 `npm run verify:template-domain-boundary`로 확인합니다. Tailwind theme·provider topology는 `npm run verify:design-system-modes` 및 `npm run build`를 사용합니다. 설치 topology나 consumer composition을 바꾸면 consumer mode 검증도 실행합니다.

Typecheck·source gate·production build는 브라우저에서의 배치나 keyboard/focus 동작을 증명하지 않습니다. modal top layer, focus 복귀, responsive layout, reduced-motion은 브라우저 확인 결과를 별도로 기록합니다.
