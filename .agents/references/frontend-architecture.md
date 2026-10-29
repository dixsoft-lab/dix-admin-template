# Frontend 아키텍처

이 문서는 template source의 역할과 소비 프로젝트의 확장 위치를 정의합니다. 실행 도구·버전은 [도구 명세](spec.md), 설치·adapter 예제는 [소비 프로젝트 안내](consumer-guide.md), 작업별 Skill 선택은 [AGENTS](../../AGENTS.md)를 읽습니다.

## 앱 조립과 소유권

[main.tsx](../../src/main.tsx)는 React root와 StrictMode를 시작합니다. [App](../../src/app/App.tsx)은 공통 CSS를 import하고 소비자가 전달한 `consumer: ComponentType`을 렌더링합니다. Consumer는 provider·router·shell·실제 authentication·authorization·navigation·brand 구현을 조립하는 composition root(조립 시작점)입니다.

Consumer가 없는 development에서는 [DemoApp](../../src/app/demo/DemoApp.tsx)을 lazy import합니다. DemoApp은 메모리 세션·항목·저장 timer와 Router 수명주기를 소유합니다. Production에서 consumer가 없으면 명시적인 설정 오류 화면을 보여주며 demo를 로드하지 않습니다.

| 책임        | Template 제공                                                            | 소비 프로젝트 제공                                  |
| ----------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| 인증 UI     | Auth state contract, loading/error/anonymous 표시, login/logout callback | 인증 provider·세션 복구·실제 login/logout 요청      |
| 권한 UI     | capability allowlist와 default deny, 메뉴·화면 표시                      | 서버가 판정한 capability와 backend authorization    |
| 브랜드·탐색 | shell·sidebar·문서 title·선택 상태                                       | title/logo/token, navigation label/path/icon/badge  |
| 업무 데이터 | controlled form/table/async state UI                                     | API·Validation Schema·Query·Mutation·Business Logic |
| 배포        | 앱 root 기준 Vite build와 base/env/output override                       | hosting·environment secret·서버 fallback 설정       |

## 역할별 source 지도

```text
src/
├── main.tsx
├── app/                         # 앱 조립, 명시적 route, 개발 demo
├── page/
│   ├── demo/                    # props로 동작하는 개발 예제 화면
│   └── home/                    # 초기 단일 화면 예제, 현재 router에는 미등록
├── layout/admin/                # AdminShell, Sidebar, Navigation
├── component/
│   ├── authentication/          # AuthBoundary
│   ├── authorization/           # CapabilityBoundary
│   ├── design-system/           # provider facade, embedded primitive, token/CSS
│   ├── overlay/                 # modal·toast provider와 lifecycle
│   └── ui/                      # form·table·breadcrumb·async state 등
├── contract/
│   ├── authentication/          # AuthAdapter, AuthState, AuthenticatedUser
│   ├── authorization/           # PermissionAdapter와 capability 판정
│   └── navigation/              # NavigationItem, AdminBrand, Navigate
├── hook/                        # 공통 interaction Hook
├── route/                       # app-local path와 dynamic builder
└── style/                       # shell CSS
```

Template은 역할별 재사용 기반만 제공합니다. 제품 기능, 제품 Domain model, API 응답과 business rule을 새 role로 추가하지 않습니다. 소비 프로젝트는 자체 architecture에서 해당 책임을 소유합니다. [home 화면](../../src/page/home/index.ts)은 bootstrap 예제이며 현재 demo route의 entry가 아닙니다.

## 역할 의존과 공개 API

역할 이름은 담당 책임을 나타냅니다. 허용하는 의존 방향은 다음 표와 같으며, 상위 조립 역할인 `app`만 모든 template 역할을 연결할 수 있습니다.

| Source 역할 | 허용 대상 역할                                    |
| ----------- | ------------------------------------------------- |
| `app`       | 모든 역할                                         |
| `page`      | `component`, `contract`, `hook`, `route`, `style` |
| `layout`    | `component`, `contract`, `hook`, `route`, `style` |
| `component` | `component`, `contract`, `hook`, `route`, `style` |
| `contract`  | `contract`                                        |
| `hook`      | `contract`, `route`                               |
| `route`     | 내부 source 없음                                  |
| `style`     | 내부 TypeScript source 없음                       |

같은 모듈 안에서는 상대 경로를 사용합니다. 다른 역할 또는 모듈을 참조할 때는 `@admin/<role>/<module>` 공개 API와 대상 `index.ts`를 사용합니다. CSS entry는 명시 경로로 import합니다. `@admin/*`는 이 앱의 `src/*`를 가리킵니다. `main.tsx → @admin/app/App`는 bootstrap 예외입니다.

| 공개 경계                                                             | 주요 제공 항목                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [contract/authentication](../../src/contract/authentication/index.ts) | `AuthAdapter`, `AuthState`, `AuthenticatedUser`                     |
| [contract/authorization](../../src/contract/authorization/index.ts)   | `PermissionAdapter`, `canAccessCapability`                          |
| [contract/navigation](../../src/contract/navigation/index.ts)         | `NavigationItem`, `AdminBrand`, `Navigate`                          |
| [layout/admin](../../src/layout/admin/index.ts)                       | `AdminShell`, `Sidebar`, `Navigation`                               |
| [component/ui](../../src/component/ui/index.ts)                       | `DataTable`, `FormField`, `AsyncState`, `Combobox`, `Breadcrumb` 등 |
| [component/overlay](../../src/component/overlay/index.ts)             | `OverlayProvider`, `useOverlay`, modal/toast controller             |
| [component/design-system](../../src/component/design-system/index.ts) | primitive facade, provider 선택과 타입                              |
| [hook](../../src/hook/index.ts)                                       | selection·pending navigation·sticky header·section navigation Hook  |
| [route](../../src/route/index.ts)                                     | `adminRoutePath`, `adminRouterBasename`                             |

공개 CSS entry는 [styles.css](../../src/component/design-system/styles.css), [tokens.css](../../src/component/design-system/tokens.css), [ui.css](../../src/component/ui/ui.css), [shell.css](../../src/style/shell.css)입니다. Architecture 검증기는 허용된 역할 의존, 모듈 공개 API, 순환 import를 검사합니다.

폴더와 소유 식별자는 단수형을 사용하고 컬렉션에는 `List`, `Map`, `Set`을 붙입니다. Component·Provider 파일은 PascalCase, export Hook은 `useXxx`, 일반 API·model·type·utility·CSS는 kebab-case입니다. React component는 `const` arrow function을 사용합니다.

## Route 계약

Canonical source는 [src/route/route-paths.ts](../../src/route/route-paths.ts)와 [src/app/route/router.tsx](../../src/app/route/router.tsx)입니다. 경로 값을 추가하는 것만으로 route가 등록되지는 않습니다.

1. `adminRoutePath`에 app-local path 또는 dynamic pattern을 선언합니다. Dynamic URL builder는 `generatePath(pattern, parameter)`를 사용합니다.
2. `AdminRouteElementMap`에 소비자가 주입할 element를 정의하고 `createAdminRouteList`의 JSX에 실제 `Route`를 등록합니다.
3. [route-handle](../../src/app/route/route-handle.ts)에 title·breadcrumb를 연결합니다. Navigation·redirect·guard·breadcrumb에는 같은 path API를 사용합니다.
4. `createAdminRouter(element, { basename })`가 위 route list를 `createBrowserRouter`에 전달합니다. 기본 basename `/`과 app-local path를 분리합니다.
5. `AuthenticatedRoute`와 consumer capability boundary를 필요한 element에 조립합니다. 메뉴를 숨기는 것만으로 접근을 허용하거나 거부하지 않습니다.

예를 들어 mount가 `/admin`이어도 내부 path는 `/item`이며 주소는 `/admin/item`입니다. Router 안의 Navigation은 `useHref`로 실제 anchor href를 만들고 일반 클릭 callback에는 app-local path를 전달합니다. Router 없는 shell consumer는 완전한 href와 이동 callback을 직접 제공합니다. Breadcrumb의 router link는 `renderLink`로 `Link`를 주입합니다.

`useAdminRoutePresentation`은 현재 match handle에서 title·breadcrumb를 계산합니다. Route source verifier는 factory 연결, 명시 등록, basename 혼입, raw 내부 route/href와 dynamic builder를 검사합니다.

## Design system과 theme

[DesignSystemProvider](../../src/component/design-system/DesignSystemProvider.tsx)는 React subtree에 primitive 구현을 제공합니다. `embedded`는 앱 내부 source를 쓰고, `workspace`·`external`은 소비자가 import한 component map을 받습니다. 외부 package 경로는 template이 동적으로 탐색하지 않습니다.

모든 provider는 `Button`, `Input`, `Badge`, `Skeleton`과 [동일한 prop contract](../../src/component/design-system/design-system-contract.ts)을 제공해야 합니다. Provider package CSS는 소비자가 명시적으로 import합니다. 재사용 UI·Hook·overlay는 각 역할 모듈에서 관리합니다.

Theme root는 `.dix-admin-theme`, semantic custom property는 `--dix-admin-*`입니다. `AdminBrand.token`으로 consumer theme를 root에 적용합니다. `OverlayProvider`를 theme root 안에 두어 modal·toast가 같은 token을 상속하게 합니다.

`tokens.css`와 `styles.css`는 React import와 JSX runtime이 없는 plain CSS entry입니다. React가 없는 consumer도 CSS를 복사하거나 bundler에서 import할 수 있습니다. Component facade와 Hook은 React 19 consumer용입니다. 이 repository의 root는 private app이며 외부 npm package의 export map을 제공한다고 가정하지 않습니다.

## 소비 기능과 데이터 흐름

소비 프로젝트는 제품 page·feature·entity·API를 template source에 추가하지 않고, 소비 앱의 기존 architecture에서 사용자 과업과 Domain 소유자를 정합니다. 화면은 form 입력·loading·empty·error·pending 표시를 담당하고, 업무 판단과 사용자 명령은 제품 기능이 소유합니다.

소비 프로젝트의 데이터 흐름은 `UI → Query/Mutation Hook → Domain API → backend`입니다. 조회는 Query, 변경·업로드·명령은 Mutation으로 관리합니다. API 응답의 필드·null·배열 요소는 선택한 Validation Schema로 검증한 뒤 model로 변환합니다. Query key·cache·invalidate 정책은 해당 Domain 경계에서 정의합니다.

현재 template은 Query library·schema library·backend SDK를 설치하지 않습니다. 소비 프로젝트가 도구를 선택하면 [spec](spec.md)의 dependency·명령과 실제 source를 함께 갱신합니다. authentication·authorization adapter는 backend 결과를 UI contract로 변환하며, 서버 authorization은 항상 소비 backend의 책임입니다. `AuthenticatedUser`는 shell에 표시할 사용자명과 설명만 담는 UI 계약이고, 제품 계정 model을 대신하지 않습니다.

## 검증과 변경 순서

역할·모듈 경계를 바꾸면 `npm run verify:template-architecture`와 `npm run verify:template-domain-boundary` 및 관련 negative fixture를 확인합니다. Route·provider 변경은 각각 route verifier와 provider verifier를 실행합니다. 소비 설치 topology가 바뀌면 clean consumer install/typecheck/build matrix를 실행합니다. 문서·toolchain 변경은 `verify-agent-docs.mjs`의 manifest·lock·path 검사를 사용합니다.

브라우저의 modal top layer·keyboard·focus·reduced-motion·network 요청은 브라우저에서 관측해야 합니다. jsdom·static source·build 결과를 그 증거로 대체하지 않습니다. 현재 자동화 범위와 명령은 [도구 명세](spec.md)를 따릅니다.
