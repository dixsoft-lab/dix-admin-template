---
name: dix-admin-tailwind-source-workflow
description: "Dix Admin의 실제 Tailwind 버전·CSS 진입점·디자인 token·인접 component를 근거로 UI를 작성·수정·리뷰하고 utility class를 확인할 때 사용한다."
metadata:
  version: "1.0.0"
---

# 실제 source 기반 Tailwind 작업

현재 설치 버전과 source를 먼저 읽고, 이 저장소의 token·컴포넌트·포맷 경계를 따릅니다. 다른 프로젝트의 경로와 디자인 값을 그대로 가져오지 않습니다.

## 적용 시점

Tailwind CSS entry·theme token·utility class·ESLint class wrapping·CSS source 경계를 추가하거나 수정할 때 적용합니다.

## 참조

- [Tailwind source workflow](../../references/tailwind-source-workflow.md): 현재 버전·entry·formatter·lint 기준.
- [Frontend 아키텍처](../../references/frontend-architecture.md): style·component source 책임과 import 경계.
- [디자인 시스템](../../references/dix-admin-design-system.md): 실제 token과 공통 component 표현.
- [파일명과 코드 식별자 규칙](../../references/naming-conventions.md): 파일 이동과 TypeScript 포맷.
- [도구 명세](../../references/spec.md): manifest·lockfile·명령 검증.
- [권장 표기 검사](references/canonical-classes.md): 정적 utility 후보의 검사 범위와 제한.

## 작업 순서

1. `AGENTS.md`, [파일명과 코드 식별자 규칙](../../references/naming-conventions.md), 디자인 시스템과 인접 component를 읽습니다.
2. `package.json`·lockfile에서 Tailwind 버전을 확인하고 `src/style/tailwind.css`, `vite.config.ts`, 실제 token을 대조합니다. 오래된 `tailwind.config.*` 관행이나 다른 프로젝트 theme를 추측하지 않습니다.
3. 기존 token과 공통 UI component를 재사용합니다. CSS 파일을 추가하거나 JSX 표현을 component 인접 stylesheet로 옮기지 않습니다.
4. TypeScript·TSX는 저장소 `.prettierrc`에 따라 Prettier로 작성·검사합니다. Biome formatter를 함께 실행하지 않습니다. `biome.json`은 import 정렬용 editor 설정이며 이 repository에는 Biome CLI dependency나 lint script가 없습니다.
5. class 줄바꿈 변경은 ESLint `enforce-consistent-line-wrapping`의 네 class·group 분리 없음·한 줄 우선 설정을 따릅니다. lint warning도 결과에 구분해 보고합니다.
6. canonical 표기 검사가 필요하면 [읽기 전용 script](references/canonical-classes.md)를 실행합니다. unstable API 오류를 통과로 취급하지 않습니다.
7. source 변경의 typecheck·build·경계 검증과 화면 확인은 각각의 증거로 남깁니다.

## 검증

```sh
npm run lint
npx --no-install prettier --check <파일>
npm run typecheck
npm run build
node .agents/skills/dix-admin-tailwind-source-workflow/scripts/check-canonical-classes.mjs --root . --stylesheet src/style/tailwind.css --path src --root-font-size 16
```

수정 파일은 먼저 `npx --no-install prettier --write <파일>`을 실행하고 `--check`로 다시 검사합니다. canonical script는 모든 작업에서 필수인 lint가 아니며, 필요할 때 검사 범위를 명시해 사용합니다.

## 경계

- Tailwind CSS 4의 유일한 CSS entry는 `src/style/tailwind.css`입니다. token·`@source`·전역 keyframes도 이 파일에서 확인합니다.
- ESLint wrapping은 줄바꿈만 검사합니다. canonical utility 여부는 제공된 별도 읽기 전용 script의 결과로만 보고합니다.
- canonical script는 Tailwind 내부 unstable API를 사용합니다. 설치 버전이 해당 API를 제공하지 않으면 검사가 불가능한 상태로 남깁니다.
- USP-web 제품 경로·token·제품 CSS source map은 옮기지 않습니다. 소비 앱이 Tailwind source를 추가해야 하는 경우에는 [소비 프로젝트 안내](../../references/consumer-guide.md)를 따릅니다.

## 증거

확인한 CSS entry·Tailwind 버전·실행한 lint와 포맷 명령·종료 상태·수정한 source를 기록합니다. browser에서 확인하지 않은 hover·focus·layout 상태는 시각 검증으로 보고하지 않습니다.
