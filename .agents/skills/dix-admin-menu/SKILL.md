---
name: dix-admin-menu
description: "Dix Admin Demo 또는 consumer의 Sidebar 메뉴 item·section·capability를 추가·수정하거나 표시 순서와 active 상태를 점검할 때 사용한다."
metadata:
  version: "1.0.0"
---

# Dix Admin 메뉴 추가와 연결

## 적용 시점

Demo 또는 consumer 앱에서 메뉴 항목·섹션·아이콘·badge·capability를 추가하거나 변경하고, 메뉴와 Route의 연결·active 표시를 점검할 때 적용한다.

## 참조

- [Frontend 아키텍처](../../references/frontend-architecture.md): Route 등록, shell composition, consumer 경계.
- [소비 프로젝트 안내](../../references/consumer-guide.md): consumer가 `Shell`과 Navigation adapter를 연결하는 방법.
- [도구 명세](../../references/spec.md): route·contract 검증 명령.
- [Route Skill](../dix-admin-route/SKILL.md): path·basename·redirect·breadcrumb를 함께 변경할 때 사용한다.

## 작업 순서

1. 메뉴 목록의 소유자를 확인한다. 소비 앱은 자체 `NavigationItem[]`를 만들어 `Shell.navigationList`로 전달한다. 개발 Demo의 목록은 `src/app/demo/demo-adapter.ts`의 `demoNavigationList`가 소유한다. 공통 `src/layout/Navigation.tsx`는 전달받은 항목을 렌더링하므로 제품 메뉴를 여기에 하드코딩하지 않는다.
2. 새 메뉴가 가리킬 Route가 있는지 확인한다. 기존 Route면 canonical `routePath`의 app-local path를 재사용한다. 새 Demo page라면 `src/route/route-paths.ts`, `src/app/route/route-contract.ts`, `src/app/route/router.tsx`, `src/app/route/route-handle.ts`, `src/app/demo/DemoApp.tsx`의 element 등록을 함께 갱신한다. Consumer 전용 page는 consumer router에 등록하고 template Demo router에는 넣지 않는다.
3. `NavigationItem`에 `path`와 `label`을 제공하고 필요한 경우 `section`, `icon`, `badge`, `capability`를 연결한다. 배열 순서가 항목 순서이며 같은 `section`은 첫 등장 순서대로 한 그룹에 모인다. `section` 생략은 제목 없는 기본 그룹에 표시한다. 새 Demo page는 위 Route 연결과 `demoNavigationList` 등록을 함께 수행한다.
4. 권한 메뉴는 consumer의 `PermissionAdapter`와 route guard를 함께 확인한다. `capability`가 없는 메뉴는 표시된다. 지정한 capability는 `capabilityList`에 등록되고 `allows()`가 `true`일 때만 표시되며, 미등록 값은 거부된다. 메뉴 숨김은 직접 URL 접근을 보호하지 않으므로 필요한 page element에도 capability boundary를 적용한다.
5. `activePath`는 pathname과 search를 포함해 전달한다. Review처럼 pathname을 공유하고 query로 나뉘는 메뉴는 각 항목에 구별되는 query를 포함해야 정확한 항목 하나만 active 처리된다. Router 안에서는 component가 `useHref`로 basename을 반영한 실제 href를 제공하므로 메뉴 path에 mount prefix를 넣지 않는다.
6. 기존 Navigation의 semantic link, hover·focus, responsive 표현을 유지한다. Section label은 12px semibold와 subtle grayscale, 기본 menu label은 14px medium, active label은 semibold와 primary-soft 배경을 사용한다. Icon은 장식용일 때만 `aria-hidden`으로 처리하고, 선택 상태는 `aria-current`로 표시한다.

## 검증

- Route를 추가·변경하면 `npm run verify:template-routes`와 `npm run verify:template-architecture`를 실행한다.
- Navigation contract 또는 capability 경계를 변경하면 `npm run verify:template-contracts`와 `npm run verify:template-domain-boundary`를 실행한다.
- source를 변경하면 `npm run lint`, `npm run typecheck`, `npm run build`와 변경 파일 Prettier 확인을 실행한다.
- 브라우저에서 메뉴 클릭과 새로고침 직접 진입, 중첩 경로 active 표시, query별 active 상태, 허용·거부 capability, 720px 이하 탐색 배치를 확인한다. Route guard의 직접 URL 결과도 메뉴 표시와 별도로 확인한다.

## 경계

- `NavigationItem[]`는 consumer가 소유하는 adapter data다. 제품 역할·API·Domain 규칙을 공통 `Navigation`에 추가하지 않는다.
- UI에서 메뉴를 숨기는 것만으로 접근 제어가 되지 않는다. route guard는 화면 경계이며 backend authorization은 소비 제품이 소유한다.
- 새 menu용 공통 registry나 별도 Sidebar를 만들지 않는다. 기존 `Shell`, `Sidebar`, `Navigation` 연결을 재사용한다.
- 모든 메뉴 path는 현재 앱의 route 체계에 맞춘 app-local path로 유지하고 basename은 router에 맡긴다.

## 증거

추가·변경한 메뉴 목록 위치, 연결한 route와 capability, 확인한 active·responsive 상태 및 실행한 source verifier의 결과를 기록한다. 실행하지 않은 브라우저·권한 검증은 통과로 보고하지 않는다.
