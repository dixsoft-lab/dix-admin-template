# Demo Page 안내

## 담당 경계

- `page/demo/`는 `/demo` route 아래에서 component 사용법과 admin 화면 구성을 확인하기 위한 로컬 예시입니다. 제품 데이터·API·backend 동작을 소유하지 않습니다.
- 새 consumer 프로젝트에서 Demo 확인을 마치면 `npm run remove:demo`로 `app/demo/`와 `page/demo/`를 한 번에 제거할 수 있습니다.
- 각 route 화면은 route 관계를 반영한 하위 폴더에 한 개씩 둡니다. 예: `item/DemoListPage.tsx`, `item/detail/DemoDetailPage.tsx`, `item/new/DemoFormPage.tsx`; `account/` 아래 목록·신규·접근 거부 화면도 각각 별도 폴더에 둡니다. Story list·new·edit도 `story/`, `story/new/`, `story/detail/`로 나눕니다. `page/demo/` 자체는 route namespace이며 여기에 여러 화면을 평면적으로 모으지 않습니다.
- 공통 로딩 hook은 `shared/useDemoLoading.ts`, item 예시의 상태와 record type은 `item/demo-record.ts`에 둡니다. Story 등록·편집 Page는 `story/shared/StoryEditorView.tsx` composition을 공유합니다. Page element는 `app/demo/DemoApp.tsx`에서 route와 연결합니다. 각 Page의 테스트는 해당 Page 폴더 옆에 둡니다.
- 공통 UI의 전체 사용법과 디자인 규격은 [DESIGN.md](../../../DESIGN.md), 화면·route 계약은 [Frontend 아키텍처](../../../.agents/references/frontend-architecture.md)를 확인합니다.
- 새 화면에는 matching layout의 `DemoXPageSkeleton.tsx`를 같은 page 영역에 둡니다. `Skeleton` primitive는 비동기 응답을 기다리는 데이터 바인딩 값 자리에만 사용합니다. 제목, label, 고정 설명, filter·segment, table caption·column header, section heading, 고정 버튼 이름·단위·문장 연결어는 loading 중에도 그대로 렌더링합니다. 서버 데이터가 없는 신규 form이나 고정 설정에는 skeleton을 두지 않습니다. Text skeleton은 바인딩 문자열의 평균 길이와 줄 수를 반영하고 부모 `aria-busy` 및 status 안내를 설정합니다. 데이터가 들어온 뒤에도 위치·너비·높이·줄 수·정렬·간격이 바뀌지 않아야 하며, wrapper를 로딩 상태에만 추가하지 않습니다. 컬렉션 길이를 모르면 페이지 크기나 고정된 결과 영역 높이를 예약해 loading→loaded 전환의 CLS가 0이 되게 검수합니다. Skeleton은 pulse가 아닌 USP Web 스타일의 흐르는 gradient shimmer를 사용합니다.

## 변경 규칙

- 화면을 추가하거나 이동하면 `src/app/route/route-contract.ts`, `router.tsx`, `route-handle.ts`, `src/app/demo/DemoApp.tsx`, `src/route/route-paths.ts`, `src/layout/Navigation.tsx` 연결을 확인합니다.
- page module 또는 data source가 Suspense를 지원하면 `DemoApp`의 page element 조립에서 `<Suspense fallback={<DemoXPageSkeleton />}>`를 연결합니다. `App.tsx`의 global `fallback={null}`은 유지하고 page fallback으로 바꾸지 않습니다.
- 데이터 바인딩을 보여주는 일반 demo loading은 `useDemoLoading`의 300ms 비-Suspense 예시를 사용할 수 있습니다. 고정 UI는 두 상태에서 동일하게 유지하고 데이터 값만 skeleton으로 교체합니다. 신규 form처럼 비동기 데이터가 없는 화면에는 fake loading을 추가하지 않습니다. 동일 skeleton component를 Suspense fallback과 branch에서 재사용할 수 있습니다. Suspense data source를 쓰는 화면에는 별도 `isLoading` branch를 중복 구현하지 않습니다. 저장(600ms)이나 `PendingButton`(900ms)처럼 다른 비동기 예시의 시간은 일괄 변경하지 않습니다.
- Editor template은 고정 SectionRail과 본문 내부 스크롤을 사용합니다. 섹션 선택·스크롤 관찰 계약을 유지합니다.
- ChipInput으로 한글 태그를 입력할 때 composition/IME이 끝나기 전에 Enter를 처리하지 않습니다. 제안 목록은 키보드 이동, 선택, 빈 결과 상태를 연결합니다.
- 화면 안의 필터·pagination 같은 상태는 실제 서비스 데이터로 오인되지 않도록 예시 데이터 경계를 명시합니다.
