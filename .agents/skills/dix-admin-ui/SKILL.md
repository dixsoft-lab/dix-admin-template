---
name: dix-admin-ui
description: "Dix Admin의 공통 UI, interaction Hook, theme, form, table 또는 modal·toast 접근성을 구현하거나 수정할 때 사용한다."
metadata:
  version: "1.1.0"
---

# Dix Admin UI와 상호작용

## 적용 시점

공통 component·Hook 추가, 화면의 loading·empty·error·pending 표시, theme 변경, overlay keyboard·focus 문제에 적용한다.

## 참조

- [Frontend 아키텍처](../../references/frontend-architecture.md): component·hook·layout 역할과 provider 경계.
- [소비 프로젝트 안내](../../references/consumer-guide.md): theme root·Tailwind entry와 consumer의 controlled props.
- [도구 명세](../../references/spec.md): 실제 CSS·포맷·검증 도구.

## 작업 순서

1. [`DESIGN.md`](../../../DESIGN.md)의 실제 component 목록과 `component/ui`, `component/overlay`, `hook`, `layout`의 source를 읽어 기존 component·Hook으로 표현할 수 있는지 확인한다. 공통화는 반복되는 UI 계약과 interaction이 같은 경우에 한정한다.
2. 제품 model·API 응답 대신 표시 값, controlled state와 event callback을 받는 prop을 설계한다. Business Logic과 서버 요청은 consumer feature가 소유하게 한다.
3. Primitive는 `component/ui`의 `Button`, `Input`, `Badge`, `Skeleton`과 `DesignSystemProvider`를 사용한다. `data-theme-root`에 적용되는 Tailwind theme token을 사용하고 외부 provider source를 consumer의 Tailwind scan 범위에 포함한다.
4. Modal·toast는 theme root 안의 `OverlayProvider`와 `useOverlay`를 사용한다. Focus 진입·복원, Escape·Tab, pending close, stale controller, scroll lock 및 cleanup을 유지한다.
5. UI 표시 상태와 disabled·pending 동작을 구현하고 label·keyboard·focus·responsive·reduced-motion을 변경한 화면에서 확인한다. Tailwind CSS 4는 `src/style/tailwind.css`를 진입점으로 쓰며 component 인접 CSS를 만들지 않는다.

## 검증

`npm run typecheck`, `npm run build`, 변경 component·Hook의 `npm test -- --run <대상>`을 실행한다. 공개 API 이동은 `npm run verify:template-architecture`, provider 변경은 `npm run verify:design-system-modes`로 확인한다. 변경 파일은 `npx --no-install prettier --write <파일>` 뒤 `npx --no-install prettier --check <파일>`로 확인한다.

## 경계

- Domain prop, backend SDK, 제품 role·brand·endpoint를 공통 UI에 넣지 않는다.
- Tailwind theme와 JSX utilities는 React 19 앱의 source contract다. Component 표현은 `className` utilities에 둔다.
- jsdom의 dialog fake·focus assertion은 실제 browser top layer·layout·animation 관측을 대체하지 않는다. 브라우저 검증 절차는 [검증 Skill](../dix-admin-verify/SKILL.md)을 따른다.

## 증거

사용한 public API·token, 변경한 interaction 상태, test/build exit와 로그를 남긴다. Keyboard·focus·responsive·reduced-motion 결과에는 실제 browser와 screenshot/trace 경로 또는 실행 불가 사유를 기록한다.
