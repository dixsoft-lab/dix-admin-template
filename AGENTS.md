# 에이전트 작업 지도

작업 전에 [Frontend 아키텍처](.agents/references/frontend-architecture.md), [디자인 시스템](DESIGN.md), [도구 명세](.agents/references/spec.md)를 읽습니다. 설치·consumer 조립은 [소비 프로젝트 안내](.agents/references/consumer-guide.md)를 따릅니다. Skills·reference 설치 및 갱신은 [Agent Kit 설치 안내](.agents/references/agent-kit-installation.md)를 확인합니다.

## 작업별 안내

| 작업                                     | 먼저 읽을 문서                                                                                                               | project-local Skill                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Standalone·monorepo setup, provider 선택 | [소비 프로젝트 안내](.agents/references/consumer-guide.md)                                                                   | `.agents/skills/dix-admin-setup/SKILL.md`   |
| Route·path·basename·navigation           | [Route 계약](.agents/references/frontend-architecture.md#route-계약)                                                         | `.agents/skills/dix-admin-route/SKILL.md`   |
| UI·theme·overlay·keyboard·focus          | [디자인 시스템](DESIGN.md), [Design system과 Tailwind](.agents/references/frontend-architecture.md#design-system과-tailwind) | `.agents/skills/dix-admin-ui/SKILL.md`      |
| 소비 화면·제품 기능                      | [소비 기능과 데이터 흐름](.agents/references/frontend-architecture.md#소비-기능과-데이터-흐름)                               | `.agents/skills/dix-admin-feature/SKILL.md` |
| API·schema·Query·Mutation                | [소비 기능과 데이터 흐름](.agents/references/frontend-architecture.md#소비-기능과-데이터-흐름)                               | `.agents/skills/dix-admin-data/SKILL.md`    |
| 검증·회귀 확인·변경 전달                 | [명령과 자동 검증 범위](.agents/references/spec.md#명령)                                                                     | `.agents/skills/dix-admin-verify/SKILL.md`  |
| architecture·toolchain·Skill 변경        | architecture·spec·해당 Skill source                                                                                          | source verifier와 문서를 함께 갱신          |

표의 Skill 경로는 이 저장소의 project-local 설치 위치입니다. 작업 시 해당 `SKILL.md`를 확인하고 따릅니다. 파일이 없으면 설치 상태를 확인하고 다른 저장소나 전역 Skill을 지침으로 적용하지 않습니다.

## Source 규칙

- 역할별 source 경계를 유지합니다. `app`은 앱 조립, `page`는 화면, `layout`은 Shell·Sidebar·Navigation, `component`는 재사용 UI, `contract`는 consumer adapter 계약, `hook`은 재사용 interaction, `route`는 path 정의, `style`은 Tailwind entry를 소유합니다.
- `src/component/ui`에 design-system primitive와 모든 공통 UI를 둡니다. `layout`은 이미 앱 공통 shell 역할입니다. `layout/admin` 구조를 새로 만들지 않습니다.
- 같은 module 안에서는 상대 경로를 사용합니다. 역할이나 module 경계를 넘을 때 `@/component/ui/Button`처럼 구체 파일을 import합니다. `src/**/index.ts` barrel을 만들지 않습니다. Provider package fixture의 `index.js`·`index.d.ts`는 실제 package entrypoint로 유지합니다.
- JSX component·Provider는 PascalCase, export Hook은 `useXxx`, 일반 module은 kebab-case입니다. 폴더·source owner 이름은 단수형, 컬렉션 prop은 `List`·`Map`·`Set` 접미사를 사용합니다. 제품 UI에서 재사용할 코드 식별자는 제품명과 `Admin` 접두어를 포함하지 않습니다.
- 제품 API·Domain model·Business Logic은 소비 프로젝트가 소유합니다. 공통 UI에 backend SDK·제품 role·brand·endpoint를 넣지 않습니다.

## 계약과 접근 경계

- Template의 `contract/authentication`은 `AuthAdapter`, `AuthState`, `AuthenticatedUser`를 정의하고 `component/authentication/AuthBoundary`와 `layout/Shell`이 이를 표시합니다. 로그인·로그아웃·session은 소비 adapter에서 구현합니다.
- `contract/authorization`의 `PermissionAdapter`와 `CapabilityBoundary`는 UI capability 결과를 반영합니다. 등록되지 않은 capability는 기본 거부합니다. 서버 authorization은 제품 backend가 수행합니다.
- Navigation과 Brand는 consumer contract에서 주입합니다. `Brand.token`은 `data-theme-root`의 Tailwind CSS variable에 적용합니다.
- `routePath` 추가와 실제 `Route` 등록을 함께 수행합니다. Dynamic path는 `generatePath`, 배포 mount는 별도 `basename`으로 관리합니다.
- Tailwind CSS 4의 단일 entry는 `src/style/tailwind.css`입니다. component·page 인접 CSS 파일을 추가하지 않고 JSX `className` utilities로 표현합니다. 전역 token·base 설정·keyframes는 이 entry에서 관리합니다.

## 검증과 보고

[spec의 명령](.agents/references/spec.md#명령) 중 변경 경계에 해당하는 검증을 실행합니다. Typecheck, build, 테스트, source boundary, route, provider·consumer topology의 결과를 각각 구분합니다. 실패는 원인과 재현 출력을 확인하고 수정한 뒤 해당 검증을 반복합니다.

문서·Skill 변경은 링크·경로·명령·manifest·lock 버전을 대조합니다. UI 변경은 관련 브라우저 화면과 주요 폭·keyboard·focus·reduced-motion 상태를 확인하고 시각 검증 결과를 source/build 결과와 분리해 보고합니다. Hosted CI·배포 결과는 로컬 검증으로 표현하지 않습니다.
