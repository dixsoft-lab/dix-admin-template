---
name: dix-admin-route
description: "Dix Admin의 path, 명시적 Route 등록, basename, navigation, redirect, title 또는 breadcrumb를 추가하거나 변경할 때 사용한다."
metadata:
  version: "1.1.0"
---

# Dix Admin 경로 변경

## 적용 시점

새 page 연결, dynamic URL, mount basename 변경, menu·redirect·breadcrumb·title의 경로 불일치를 다룰 때 적용한다.

## 참조

- [Frontend 아키텍처](../../references/frontend-architecture.md): Route 계약과 source 책임.
- [소비 프로젝트 안내](../../references/consumer-guide.md): basename 및 consumer page map 연결.
- [도구 명세](../../references/spec.md): route 검사 명령과 Vite base 설정.

## 작업 순서

1. `src/route/route-paths.ts`의 `adminRoutePath`와 별도 `adminRouterBasename`, `src/app/route/router.tsx`의 실제 등록을 함께 읽는다.
2. App-local path와 dynamic pattern을 path object에 추가한다. Dynamic URL은 `generatePath` builder로 만들고 mount prefix는 넣지 않는다.
3. `AdminRouteElementMap`과 `createAdminRouteList`의 JSX `Route`에 실제 page/system element·handle을 등록한다. `createAdminRouter`가 그 factory 결과를 `createBrowserRouter`에 전달하는 연결을 유지한다.
4. `adminRouteHandle`, navigation·redirect·guard·breadcrumb·title의 사용처를 같은 공개 path API로 맞춘다. 내부 탐색에 raw path나 raw href를 다시 쓰지 않는다.
5. 인증·capability boundary를 필요한 element에 조립한다. Router 안에서는 `Link` 또는 `useHref`가 basename을 적용하게 하고, 일반 navigation callback에는 app-local path를 전달한다.

## 검증

`npm run verify:template-routes`, `npm run verify:template-architecture`, `npm run typecheck`, `npm run build`를 실행한다. 변경한 route의 직접 URL·refresh·redirect·title·breadcrumb와 `/` 및 변경 basename 동작을 검증한다. Router 연결 검증은 `npm test -- --run src/app/route src/route`으로 실행한다.

## 경계

- 상수 추가만으로 route가 등록되지는 않는다. 자동 파일 탐색이나 별도 route manifest를 명시적 등록의 대체물로 도입하지 않는다.
- Basename과 asset base는 소비 환경에 맞추되 내부 path의 의미는 유지한다. Ctrl/Meta 클릭·새 탭에 사용되는 실제 href도 확인한다.
- UI route guard는 server authorization의 근거가 아니다. Backend 권한 연결은 소비자의 데이터 경계에서 구현한다.

## 증거

변경 path·pattern·등록 element·handle, 검증한 basename, navigation·redirect 관측과 command exit/log를 남긴다. 브라우저를 실행하지 못했다면 직접 URL·새 탭 검증을 통과로 적지 않는다.
