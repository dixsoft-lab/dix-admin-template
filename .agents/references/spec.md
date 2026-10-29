# 도구와 실행 명세

이 문서는 [package.json](../../package.json)의 선언 범위와 [package-lock.json](../../package-lock.json)의 실제 고정 버전을 구분합니다. source 책임은 [Frontend 아키텍처](frontend-architecture.md), 소비 설치는 [소비 프로젝트 안내](consumer-guide.md)를 따릅니다.

## Runtime과 package manager

| 항목   | manifest 기준 | quality workflow 설정                                       |
| ------ | ------------- | ----------------------------------------------------------- |
| `node` | `>=20.19.0`   | Node.js 20.19.0 / Node.js 24.21.0; Skills CLI는 별도 런타임 |
| `npm`  | `>=10.8.0`    | npm 10.8.0 / npm 11.19.0                                    |

`engines`가 앱과 template 명령의 지원 하한을 선언합니다. `.nvmrc`나 `.node-version`은 없으며 [quality workflow](../../.github/workflows/quality.yml)가 위 두 조합을 설정합니다. 문서 작성 환경에서 직접 확인한 실행 버전은 Node.js `24.21.0`, npm `11.19.0`입니다. Agent Kit의 `skills@1.7.4` 설치 검증은 `fs/promises.glob`을 사용하므로 Node.js `>=22.20.0`이 필요합니다. quality workflow는 Node.js 20 matrix에서 앱 검증을 마친 뒤 해당 검증만 Node.js `22.20.0`으로 실행하고, Node.js 24 matrix에서는 `24.21.0`을 사용합니다. Lockfile 형식은 `lockfileVersion: 3`이며 재현 설치에는 `npm ci`를 사용합니다.

## 직접 dependency

<!-- dependency-table:start -->

| package                  | manifest 선언 | lockfile 고정 | 역할                                        |
| ------------------------ | ------------- | ------------- | ------------------------------------------- |
| `react`                  | `19.1.1`      | `19.1.1`      | React 19 UI runtime                         |
| `react-dom`              | `19.1.1`      | `19.1.1`      | browser root와 DOM rendering                |
| `react-router-dom`       | `7.18.3`      | `7.18.3`      | explicit browser router, Link, generatePath |
| `@testing-library/react` | `16.3.0`      | `16.3.0`      | 사용자 관점의 React DOM 검증                |
| `@types/node`            | `24.3.0`      | `24.3.0`      | Node type declaration                       |
| `@types/react`           | `19.1.10`     | `19.1.10`     | React type declaration                      |
| `@types/react-dom`       | `19.1.7`      | `19.1.7`      | React DOM type declaration                  |
| `@vitejs/plugin-react`   | `5.0.2`       | `5.0.2`       | Vite React transform과 개발 갱신            |
| `jsdom`                  | `26.1.0`      | `26.1.0`      | DOM unit test 환경                          |
| `prettier`               | `^3.9.6`      | `3.9.10`      | source·문서 포맷                            |
| `typescript`             | `5.9.2`       | `5.9.2`       | strict typecheck와 AST verifier             |
| `vite`                   | `7.3.7`       | `7.3.7`       | 개발 서버와 production bundling             |
| `vitest`                 | `4.1.12`      | `4.1.12`      | unit·contract test runner                   |

<!-- dependency-table:end -->

Runtime dependency는 React·React DOM·React Router입니다. 나머지는 devDependency입니다. CSS는 plain CSS이며 Tailwind·Sass·CSS runtime은 설치하지 않았습니다. 현재 포맷 기준은 [Prettier 설정](../../.prettierrc)입니다. API·Query·Validation Schema library와 backend SDK는 소비 프로젝트가 선택하여 추가합니다.

## 명령

아래 표는 `package.json`의 script 이름과 실제 실행 문자열입니다. 실행은 앱 root에서 `npm run <이름>`으로 합니다. `test`의 일회 실행은 `npm test -- --run`입니다.

<!-- script-table:start -->

| script                            | 실행 문자열                                        | 범위                                         |
| --------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| `dev`                             | `vite`                                             | local development와 demo                     |
| `preview`                         | `vite preview`                                     | production build의 local preview             |
| `typecheck`                       | `tsc --noEmit`                                     | TypeScript source·config 타입                |
| `test`                            | `vitest`                                           | `src/**/*.test.{ts,tsx}`와 script test       |
| `build`                           | `npm run typecheck && vite build`                  | 타입 검사와 production artifact              |
| `verify:template-layout`          | `node scripts/verify-template-layout.mjs`          | 앱 root와 금지 artifact                      |
| `verify:template-contracts`       | `node scripts/verify-template-contracts.mjs`       | auth·permission·navigation·brand 계약        |
| `verify:design-system-modes`      | `node scripts/verify-design-system-modes.mjs`      | provider parity·CSS-only 소비                |
| `verify:consumer-modes`           | `node scripts/verify-consumer-modes.mjs`           | standalone·workspace clean install/build     |
| `verify:template-domain-boundary` | `node scripts/verify-template-domain-boundary.mjs` | 제품 Domain·SDK·brand 누수                   |
| `verify:template-architecture`    | `node scripts/verify-template-architecture.mjs`    | 역할 의존·모듈 공개 API·순환 import          |
| `verify:template-routes`          | `node scripts/verify-template-routes.mjs`          | path·등록·factory 연결·basename              |
| `verify:consumer-docs`            | `node scripts/verify-consumer-docs.mjs`            | 소비 안내 링크·예제·clean consumer 검증      |
| `verify:agent-docs`               | `node scripts/verify-agent-docs.mjs`               | README·architecture·spec·AGENTS 정합성       |
| `verify:agent-kit-install`        | `node scripts/verify-agent-kit-install.mjs`        | isolated consumer 설치·update·기존 규칙 보존 |
| `verify:skills`                   | `node scripts/verify-template-skills.mjs`          | 여섯 Skill metadata·reference·작업 경계      |

<!-- script-table:end -->

문서 자체는 `npm run verify:agent-docs` 또는 `node scripts/verify-agent-docs.mjs`로 검사합니다. README의 Mermaid는 `flowchart` 방향 선언, quoted node, 단일 방향 edge로 구성된 제한 문법과 연결 구조를 검사합니다. Node 이름·배치 방향·설명 문장·연결 순서는 고정하지 않습니다. Diagram이 실제 아키텍처와 요청한 개념을 설명하는지는 source와 함께 리뷰합니다. 복잡한 Mermaid 문법을 추가할 때는 verifier도 함께 갱신합니다. 이 검사는 브라우저 rendering 결과를 포함하지 않습니다. 문서 변경 시 `npx --no-install prettier --write <파일>`과 `--check`를 사용합니다. [Vitest 설정](../../vitest.config.ts)은 기본 Node 환경이며 DOM test 파일은 jsdom 환경을 명시합니다.

`typecheck`는 TypeScript source와 config의 타입을 검사합니다. [tsconfig](../../tsconfig.json)는 `allowJs`를 사용하지만 `checkJs`를 켜지 않았으므로 `.mjs` script의 타입 검사를 보장하지 않습니다. JavaScript script는 `node --check <파일>`의 구문 검사와 실제 CLI·source verifier·mutation 시나리오로 확인합니다.

## Build·환경·경로

[createAppBuildConfig](../../scripts/app-build-config.mjs)와 [Vite 설정](../../vite.config.ts)은 설정 파일의 앱 root를 기준으로 경로를 해석합니다. Standalone과 nested workspace에서 같은 규칙입니다.

| 환경 변수         | 기본값 | 의미                                              |
| ----------------- | ------ | ------------------------------------------------- |
| `ADMIN_BASE_PATH` | `/`    | Vite asset base와 소비 router에 연결할 mount 경로 |
| `ADMIN_ENV_DIR`   | `.`    | 앱 root 기준 Vite env directory                   |
| `ADMIN_OUT_DIR`   | `dist` | 앱 root 기준 build output directory               |

Default source alias는 `@admin/* → src/*`이며 TypeScript·Vite·Vitest에 일치시킵니다. `ADMIN_BASE_PATH=/console/admin/`이면 소비 router도 같은 mount basename을 사용해야 합니다. 개발 DemoApp은 `import.meta.env.BASE_URL`을 router basename에 전달합니다. Consumer adapter에는 이를 자동 주입하지 않습니다.

Vite의 `VITE_*` 값은 browser bundle에 노출되므로 secret을 넣지 않습니다. Consumer hosting은 해당 mount의 deep link를 Admin HTML로 돌려주는 fallback을 구성해야 합니다. 이 repository는 특정 hosting provider의 배포 명령을 제공하지 않습니다.

## Style artifact와 framework 경계

- [tokens.css](../../src/component/design-system/tokens.css): `.dix-admin-theme`의 semantic custom property.
- [styles.css](../../src/component/design-system/styles.css): tokens와 embedded primitive CSS를 조립하는 plain CSS entry.
- [ui.css](../../src/component/ui/ui.css): 고수준 Admin UI CSS entry.

위 stylesheet에는 React import·JSX runtime이 없습니다. CSS-only consumer는 React package 없이 token/style을 소비할 수 있습니다. `Button`, `DesignSystemProvider`, Hook·overlay 등 TSX source는 React 19 consumer용입니다. Root package는 `private: true`인 앱이며 위 경로를 npm export-map subpath라고 부르지 않습니다.

## 자동 검증 범위

[quality workflow](../../.github/workflows/quality.yml)의 `source-and-consumer` job은 두 Node/npm 조합에서 clean install, typecheck, test, build, source/provider/consumer gate와 source mutation을 실행하도록 정의되어 있습니다. `shell: bash`로 pipefail을 적용해 `tee`가 앞 명령의 실패를 숨기지 않게 합니다.

이 workflow는 browser UI·network 요청을 관측하지 않습니다. Modal keyboard·focus·top layer와 실제 backend 요청 수는 지원되는 브라우저 환경에서 별도로 검증합니다. 로컬 command 통과와 GitHub Actions provider의 실행 결과도 별도 증거로 기록합니다.
