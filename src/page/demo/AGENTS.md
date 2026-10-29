# Demo Page 안내

## 담당 경계

- `page/demo/`는 component 사용법과 admin 화면 구성을 확인하기 위한 로컬 예시입니다. 제품 데이터·API·backend 동작을 소유하지 않습니다.
- `DemoDashboardPage`, `DemoPaymentPage`, `DemoEditorPage`, `DemoListPage`, `DemoDetailPage`, `DemoReviewPage`, `DemoModerationPage`, `DemoReportPage`, `DemoStoryListPage`, `DemoStoryReportPage`, `DemoFormPage`, `DemoComponentPage`, `DemoAccountPages`, `DemoLoginPage`, `DemoNotFoundPage`가 현재 화면 template을 구성합니다.
- 공통 UI의 전체 사용법과 디자인 규격은 [DESIGN.md](../../../DESIGN.md), 화면·route 계약은 [Frontend 아키텍처](../../../.agents/references/frontend-architecture.md)를 확인합니다.
- 새 화면에는 matching layout의 `DemoXPageSkeleton.tsx`를 같은 page 영역에 둡니다. `Skeleton` primitive로 실제 header·card·table·form의 자리와 크기를 보존하고 부모 `aria-busy` 및 status 안내를 설정합니다.

## 변경 규칙

- 화면을 추가하거나 이동하면 `src/app/route/route-contract.ts`, `router.tsx`, `route-handle.ts`, `src/app/demo/DemoApp.tsx`, `src/route/route-paths.ts`, `src/layout/Navigation.tsx` 연결을 확인합니다.
- page module 또는 data source가 Suspense를 지원하면 `DemoApp`의 page element 조립에서 `<Suspense fallback={<DemoXPageSkeleton />}>`를 연결합니다. `App.tsx`의 global `fallback={null}`은 유지하고 page fallback으로 바꾸지 않습니다.
- 일반 demo loading은 `useDemoLoading`의 의도된 300ms 비-Suspense 예시이므로 현재 `isLoading` 상태 분기를 유지합니다. 동일 skeleton component를 Suspense fallback과 branch에서 재사용할 수 있습니다. Suspense data source를 쓰는 화면에는 별도 `isLoading` branch를 중복 구현하지 않습니다. 저장(600ms)이나 `PendingButton`(900ms)처럼 다른 비동기 예시의 시간은 일괄 변경하지 않습니다.
- Editor template은 고정 SectionRail과 본문 내부 스크롤을 사용합니다. 섹션 선택·스크롤 관찰 계약을 유지합니다.
- ChipInput으로 한글 태그를 입력할 때 composition/IME이 끝나기 전에 Enter를 처리하지 않습니다. 제안 목록은 키보드 이동, 선택, 빈 결과 상태를 연결합니다.
- 화면 안의 필터·pagination 같은 상태는 실제 서비스 데이터로 오인되지 않도록 예시 데이터 경계를 명시합니다.
