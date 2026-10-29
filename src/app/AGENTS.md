# App 안내

## 담당 경계

- `App.tsx`는 consumer 설정과 앱 진입을 연결합니다. `app/demo/DemoApp.tsx`는 development 전용 예시 앱입니다.
- production 앱의 인증·navigation·brand·permission 상태는 consumer adapter에서 주입합니다. demo adapter는 화면 동작을 보여 주는 로컬 예시이며 backend 인증을 수행하지 않습니다.
- demo는 첫 진입과 새로고침에서 인증된 관리 화면으로 바로 시작합니다. `/login`은 사용자가 로그아웃을 눌러 이동한 뒤 로그인 UI를 확인하는 예시 화면입니다. 앱 준비 문구나 초기 auth 판정용 빈 로딩 화면을 추가하지 않습니다.
- `App.tsx`의 `Suspense fallback={null}`은 development 전용 `DemoApp` lazy import를 위한 시작 경계입니다. 페이지별 fallback으로 간주하지 않으며, page loading UI를 이 경계에 모으지 않습니다.

## Route 변경

새 route나 demo page를 연결할 때 다음 계약을 함께 맞춥니다.

1. `src/route/route-paths.ts`의 path builder와 `src/app/route/route-contract.ts`의 element map.
2. `src/app/route/router.tsx`의 명시적 `Route` 등록과 `route-handle.ts`의 breadcrumb/document title metadata.
3. `src/app/demo/DemoApp.tsx`의 demo element 연결과 `src/layout/Navigation.tsx`의 demo navigation.
4. 각 page가 제공하는 전용 `PageSkeleton`과 해당 element를 감싸는 route-scoped `Suspense` 경계. 경계는 Shell 아래 개별 page element에 둬 공통 shell을 유지합니다.

Dynamic segment는 `generatePath`로 만듭니다. 실제 운영 소비자의 route base는 `basename` 계약으로 둡니다. UI guard는 backend authorization을 대신하지 않습니다.
