# App 안내

## 담당 경계

- `App.tsx`는 consumer 설정과 앱 진입을 연결합니다. `app/demo/DemoApp.tsx`는 development 전용 예시 앱이며 `/demo`와 그 하위 경로에서만 엽니다.
- Consumer가 없을 때 development 기본 경로에는 `app/starter/StarterApp.tsx`의 최소 Shell을 표시합니다. Sidebar navigation은 대시보드 하나이며, 브랜드 홈 링크는 항상 `/`로 돌아옵니다. 기본 로그인 UI는 Sidebar 로그아웃으로 열고, 인증 adapter가 연결되지 않은 local preview 동작임을 안내합니다.
- production 앱의 인증·navigation·brand·permission 상태는 consumer adapter에서 주입합니다. demo adapter는 화면 동작을 보여 주는 로컬 예시이며 backend 인증을 수행하지 않습니다.
- demo는 `/demo` 첫 진입과 새로고침에서 인증된 관리 화면으로 바로 시작합니다. `/demo/login`은 사용자가 로그아웃을 눌러 이동한 뒤 로그인 UI를 확인하는 예시 화면입니다. 앱 준비 문구나 초기 auth 판정용 빈 로딩 화면을 추가하지 않습니다.
- `App.tsx`의 `Suspense fallback={null}`은 development 전용 `DemoApp` lazy import를 위한 시작 경계입니다. 페이지별 fallback으로 간주하지 않으며, page loading UI를 이 경계에 모으지 않습니다.
- 복제한 consumer에서 Demo 확인을 마친 뒤 `npm run remove:demo`를 실행합니다. 이 명령은 `src/app/demo/`, `src/page/demo/`, Demo 전용 `App.test.tsx`와 `App.tsx`의 Demo 진입 분기를 제거합니다. `src/app/starter/`, 기본 Dashboard·LoginPage·DixAdminLogo, 공통 UI와 route helper는 보존합니다.

## Route 변경

새 route나 demo page를 연결할 때 다음 계약을 함께 맞춥니다.

1. `src/route/route-paths.ts`의 path builder와 `src/app/route/route-contract.ts`의 element map.
2. `src/app/route/router.tsx`의 명시적 `Route` 등록과 `route-handle.ts`의 breadcrumb/document title metadata.
3. `src/app/demo/DemoApp.tsx`의 demo element 연결과 `src/app/demo/demo-adapter.ts`의 `demoNavigationList`. Demo URL은 `/demo` 아래에 두고 router `basename`에 Demo mount를 적용합니다. `src/layout/Navigation.tsx`는 전달받은 item list를 렌더링하는 공통 component입니다.
4. 각 page가 제공하는 전용 `PageSkeleton`과 해당 element를 감싸는 route-scoped `Suspense` 경계. 경계는 Shell 아래 개별 page element에 둬 공통 shell을 유지합니다.

Dynamic segment는 `generatePath`로 만듭니다. 실제 운영 소비자의 route base는 `basename` 계약으로 둡니다. UI guard는 backend authorization을 대신하지 않습니다.
