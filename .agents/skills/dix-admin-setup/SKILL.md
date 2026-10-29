---
name: dix-admin-setup
description: "Dix Admin을 독립 저장소 또는 npm workspace에 배치하고 design-system provider와 consumer adapter를 연결할 때 사용한다."
metadata:
  version: "1.0.0"
---

# Dix Admin 시작과 연결

## 적용 시점

새 Admin 시작, standalone에서 monorepo로 이동, `embedded`·`workspace`·`external` provider 선택, demo를 실제 consumer로 바꾸는 작업에 적용한다.

## 참조

- [소비 프로젝트 안내](../../references/consumer-guide.md): 설치 명령, dependency·lock 소유권과 실행 가능한 composition 예제.
- [Frontend 아키텍처](../../references/frontend-architecture.md): app root와 공개 API 책임.
- [도구 명세](../../references/spec.md): 현재 Node/npm, package 버전과 base·env·output 설정.

## 작업 순서

1. 대상 앱 root와 기존 `package.json`·lockfile·로컬 지침을 읽고 standalone 또는 npm workspace topology를 확인한다. 기존 consumer dependency를 template manifest로 덮어쓰지 않는다.
2. Standalone은 앱 root의 manifest·lock을 사용한다. Workspace는 parent manifest에 앱을 등록하고 기존 parent lock을 갱신한다. 검증된 parent-owned dependency 방식은 소비 안내의 fixture를 따른다.
3. Provider 위치를 선택한다. `embedded`는 내부 primitive, `workspace`·`external`은 package import로 만든 component map을 `DesignSystemProvider`에 전달한다. React 19 peer와 Button·Input·Badge·Skeleton 계약을 확인하고 provider package가 utility class를 쓰면 Tailwind source 탐색 범위에 추가한다.
4. Consumer의 `AuthAdapter`, `PermissionAdapter`, navigation, brand와 page map을 조립해 `App.consumer`에 주입한다. 현재 세션의 loading·anonymous·authenticated·error와 login/logout pending·오류를 연결한다.
5. `APP_BASE_PATH`, `APP_ENV_DIR`, `APP_OUT_DIR`을 앱 root 기준으로 정하고 Router basename과 hosting deep-link fallback을 맞춘다. Production build에서 consumer 화면을 확인한다.

## 검증

앱 root에서 `npm ci`, `npm run typecheck`, `npm run build`를 실행한다. Topology·provider 변경은 `npm run verify:consumer-modes`와 `npm run verify:design-system-modes`로 실제 install/typecheck/build를 확인한다. Composition 예제 변경은 `npm run verify:consumer-docs`도 실행한다.

## 경계

- Template은 React 19와 Tailwind CSS 4 app source다. 별도 CSS-only package를 제공하지 않으며 소비 앱은 `src/style/tailwind.css`의 token과 source 탐색을 관리한다.
- Production에서 consumer가 없으면 설정 오류다. Development demo의 fake auth·메모리 데이터는 제품 인증 구현으로 사용하지 않는다.
- Unknown capability는 deny한다. Client menu·route guard는 server authorization을 대신하지 않는다.
- `VITE_*`는 client bundle에 노출된다. 특정 backend·registry·hosting·credential 정책은 consumer가 소유한다.

## 증거

선택한 topology/provider, manifest·lock 변경, base/env/output 값, install/typecheck/build의 exit와 로그 경로를 남긴다. 실제 consumer 화면·backend authorization 관측은 별도로 기록한다.
