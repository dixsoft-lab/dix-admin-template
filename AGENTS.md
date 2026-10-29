# 에이전트 작업 지도

작업 전에 [Frontend 아키텍처](.agents/references/frontend-architecture.md), [디자인 시스템](DESIGN.md), [도구 명세](.agents/references/spec.md), [파일명과 코드 식별자 규칙](.agents/references/naming-conventions.md)을 읽습니다. 설치·consumer 조립은 [소비 프로젝트 안내](.agents/references/consumer-guide.md)를 따릅니다. Skills·reference 설치 및 갱신은 [Agent Kit 설치 안내](.agents/references/agent-kit-installation.md)를 확인합니다.

## 작업별 안내

| 작업                                     | 먼저 읽을 문서                                                                                                               | project-local Skill                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Standalone·monorepo setup, provider 선택 | [소비 프로젝트 안내](.agents/references/consumer-guide.md)                                                                   | `.agents/skills/dix-admin-setup/SKILL.md`                    |
| Route·path·basename·navigation           | [Route 계약](.agents/references/frontend-architecture.md#route-계약)                                                         | `.agents/skills/dix-admin-route/SKILL.md`                    |
| UI·theme·overlay·keyboard·focus          | [디자인 시스템](DESIGN.md), [Design system과 Tailwind](.agents/references/frontend-architecture.md#design-system과-tailwind) | `.agents/skills/dix-admin-ui/SKILL.md`                       |
| Tailwind source·클래스 줄바꿈·ESLint     | [Tailwind source workflow](.agents/references/tailwind-source-workflow.md), [도구 명세](.agents/references/spec.md)          | `.agents/skills/dix-admin-tailwind-source-workflow/SKILL.md` |
| 소비 화면·제품 기능                      | [소비 기능과 데이터 흐름](.agents/references/frontend-architecture.md#소비-기능과-데이터-흐름)                               | `.agents/skills/dix-admin-feature/SKILL.md`                  |
| API·schema·Query·Mutation                | [소비 기능과 데이터 흐름](.agents/references/frontend-architecture.md#소비-기능과-데이터-흐름)                               | `.agents/skills/dix-admin-data/SKILL.md`                     |
| 검증·회귀 확인·변경 전달                 | [명령과 자동 검증 범위](.agents/references/spec.md#명령)                                                                     | `.agents/skills/dix-admin-verify/SKILL.md`                   |
| architecture·toolchain·Skill 변경        | architecture·spec·해당 Skill source                                                                                          | source verifier와 문서를 함께 갱신                           |

표의 Skill 경로는 이 저장소의 project-local 설치 위치입니다. 작업 시 해당 `SKILL.md`를 확인하고 따릅니다. 파일이 없으면 설치 상태를 확인하고 다른 저장소나 전역 Skill을 지침으로 적용하지 않습니다.

`.agents/skills/` 아래 모든 project-local Skill directory와 frontmatter `name`에는 `dix-admin-` 접두사를 사용합니다. 목록은 [Agent Kit installer](scripts/install-agent-kit.mjs)와 `npm run verify:skills`에서 함께 관리·검사합니다.

## 하위 작업 지도

| 경로                                                               | 담당 경계                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [.agents/AGENTS.md](.agents/AGENTS.md)                             | 배포 가능한 Agent Kit 문서·Skill source와 installer/verifier 정합성 |
| [scripts/AGENTS.md](scripts/AGENTS.md)                             | build helper, source verifier, 문서·consumer 검증 스크립트          |
| [src/AGENTS.md](src/AGENTS.md)                                     | 앱 source 경계와 주요 진입 흐름                                     |
| [src/app/AGENTS.md](src/app/AGENTS.md)                             | 앱 조립, 개발용 demo 진입, route 등록                               |
| [src/component/AGENTS.md](src/component/AGENTS.md)                 | 공통 UI, overlay, 인증 경계, document title 구성                    |
| [src/component/ui/AGENTS.md](src/component/ui/AGENTS.md)           | 디자인 시스템 primitive와 재사용 UI                                 |
| [src/component/overlay/AGENTS.md](src/component/overlay/AGENTS.md) | Modal·Toast와 overlay 수명주기                                      |
| [src/page/demo/AGENTS.md](src/page/demo/AGENTS.md)                 | 화면 템플릿, 데모 상태와 route 연결                                 |

하위 문서는 해당 경로의 작업에만 적용합니다. 구현 책임·소비자 연결·검증 기준은 [Frontend 아키텍처](.agents/references/frontend-architecture.md), [도구 명세](.agents/references/spec.md), 작업별 Skill과 함께 확인합니다.

## Source 규칙

- 역할별 source 경계를 유지합니다. `app`은 앱 조립, `page`는 화면, `layout`은 Shell·Sidebar·Navigation, `component`는 재사용 UI, `contract`는 consumer adapter 계약, `hook`은 재사용 interaction, `route`는 path 정의, `style`은 Tailwind entry를 소유합니다.
- `src/component/ui`에 design-system primitive와 모든 공통 UI를 둡니다. `layout`은 이미 앱 공통 shell 역할입니다. `layout/admin` 구조를 새로 만들지 않습니다.
- 같은 module 안에서는 상대 경로를 사용합니다. 역할이나 module 경계를 넘을 때 `@/component/ui/Button`처럼 구체 파일을 import합니다. `src/**/index.ts` barrel을 만들지 않습니다. Provider package fixture의 `index.js`·`index.d.ts`는 실제 package entrypoint로 유지합니다.
- JSX component·Provider는 PascalCase, export Hook은 `useXxx`, 일반 module은 kebab-case입니다. 폴더·source owner 이름은 단수형, 컬렉션 prop은 `List`·`Map`·`Set` 접미사를 사용합니다. 제품 UI에서 재사용할 코드 식별자는 제품명과 `Admin` 접두어를 포함하지 않습니다.
- 제품 API·Domain model·Business Logic은 소비 프로젝트가 소유합니다. 공통 UI에 backend SDK·제품 role·brand·endpoint를 넣지 않습니다.

## 파일명·식별자·함수 규칙

- 새 파일을 만들거나 옮기기 전에 [파일명과 코드 식별자 규칙](.agents/references/naming-conventions.md)을 읽습니다. React component·Provider는 식별자와 같은 PascalCase, export custom Hook·Query/Mutation Hook·Zustand React store는 식별자와 같은 `useXxx` camelCase, API·Query 설정·model·type·utility·CSS와 일반 폴더는 kebab-case입니다. 테스트 파일은 대상 파일명을 따르고 `.test`를 붙입니다. 다른 module이 쓰는 Hook은 component 파일에서 export하지 않고 독립 Hook 파일에 둡니다. 이름을 바꾸면 static·dynamic import, re-export, mock, test 이름, 작업 안내와 문서 링크를 함께 갱신합니다.
- Dixsoft가 소유하는 폴더명, 함수명, 변수명, 매개변수명과 import alias는 단수형으로 씁니다. 컬렉션은 단수 명사 뒤에 `List`, `Set`, `Map`, `Record`처럼 자료형을 붙입니다. 외부 API·SDK·protocol이 정한 이름과 공개 URL은 계약을 유지합니다.
- React component와 내부 함수는 `const`와 arrow function으로 선언합니다. module 공용 utility에만 named function을 허용합니다.
- 외부 데이터와 API 응답의 field type·필수 여부·null 허용·array element·범위는 프로젝트에서 쓰는 Validation Schema에 선언합니다. `typeof`·null·array 검사를 `&&`·`||`로 길게 잇는 수동 검증 조건식은 만들지 않습니다. 응답 schema 검증, 요청 대상과 응답 일치 확인, 화면 model 변환은 각각 분리합니다.
- 여러 조건을 조합하는 Business Rule에는 의미를 설명하는 이름을 붙입니다. 서로 다른 판단을 복잡한 조건식에 섞지 않고 조기 반환·`if`·`switch`로 분기합니다.
- Ternary는 단일 `condition ? valueA : valueB`만 허용합니다. 참·거짓 분기나 JSX 내부에서 다른 ternary를 중첩하지 않습니다. 줄바꿈·괄호로 나눈 경우도 중첩으로 판정하며 여러 단계 판단은 조기 반환·`if`·`switch`로 작성합니다.

## 포맷·정적 검사

- 포맷 기준은 저장소 [.prettierrc](.prettierrc)입니다. TypeScript·TSX를 수정하면 `npx --no-install prettier --write <파일>` 후 `npx --no-install prettier --check <파일>`을 실행합니다.
- `biome.json`은 editor 연동을 위한 import 정렬 설정만 둡니다. Biome dependency나 Biome lint script는 추가하지 않습니다. 실행 가능한 Tailwind class 줄바꿈 검사는 ESLint의 `npm run lint`가 담당합니다. canonical utility 검사가 필요하면 [Tailwind Skill의 읽기 전용 script](.agents/skills/dix-admin-tailwind-source-workflow/references/canonical-classes.md)를 실행하고 그 결과만 보고합니다.
- Tailwind CSS 4의 실제 source·entry point·formatter·ESLint 기준은 [Tailwind source workflow](.agents/references/tailwind-source-workflow.md)와 [`dix-admin-tailwind-source-workflow`](.agents/skills/dix-admin-tailwind-source-workflow/SKILL.md)를 따릅니다.

## 계약과 접근 경계

- Template의 `contract/authentication`은 `AuthAdapter`, `AuthState`, `AuthenticatedUser`를 정의하고 `component/authentication/AuthBoundary`와 `layout/Shell`이 이를 표시합니다. 로그인·로그아웃·session은 소비 adapter에서 구현합니다.
- `contract/authorization`의 `PermissionAdapter`와 `CapabilityBoundary`는 UI capability 결과를 반영합니다. 등록되지 않은 capability는 기본 거부합니다. 서버 authorization은 제품 backend가 수행합니다.
- Navigation과 Brand는 consumer contract에서 주입합니다. `Brand.token`은 `data-theme-root`의 Tailwind CSS variable에 적용합니다.
- `routePath` 추가와 실제 `Route` 등록을 함께 수행합니다. Dynamic path는 `generatePath`, 배포 mount는 별도 `basename`으로 관리합니다.
- Tailwind CSS 4의 단일 entry는 `src/style/tailwind.css`입니다. component·page 인접 CSS 파일을 추가하지 않고 JSX `className` utilities로 표현합니다. 전역 token·base 설정·keyframes는 이 entry에서 관리합니다.

## 검증과 보고

[spec의 명령](.agents/references/spec.md#명령) 중 변경 경계에 해당하는 검증을 실행합니다. Typecheck, build, 테스트, source boundary, route, provider·consumer topology의 결과를 각각 구분합니다. 실패는 원인과 재현 출력을 확인하고 수정한 뒤 해당 검증을 반복합니다.

문서·Skill 변경은 링크·경로·명령·manifest·lock 버전을 대조합니다. UI 변경은 관련 브라우저 화면과 주요 폭·keyboard·focus·reduced-motion 상태를 확인하고 시각 검증 결과를 source/build 결과와 분리해 보고합니다. Hosted CI·배포 결과는 로컬 검증으로 표현하지 않습니다.
