# 에이전트 작업 지도

작업 전에 [Frontend 아키텍처](.agents/references/frontend-architecture.md), [디자인 기준](DESIGN.md), [도구 명세](.agents/references/spec.md), 작업 대상에 가까운 지침을 읽습니다. 앱 설치·consumer 연결은 [소비 프로젝트 안내](.agents/references/consumer-guide.md), project-local Skills·reference 설치와 갱신은 [Agent Kit 설치 안내](.agents/references/agent-kit-installation.md)를 따릅니다.

## 작업별 routing

| 작업                                     | 먼저 읽을 reference                                                                                                             | 사용할 project-local Skill                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Standalone·monorepo setup, provider 선택 | [소비 프로젝트 안내](.agents/references/consumer-guide.md)                                                                      | `.agents/skills/dix-admin-setup/SKILL.md`   |
| Route·path·basename·navigation 변경      | [아키텍처의 Route 계약](.agents/references/frontend-architecture.md#route-계약)                                                 | `.agents/skills/dix-admin-route/SKILL.md`   |
| UI·theme·overlay·keyboard·focus          | [디자인 기준](DESIGN.md), [아키텍처의 Design system과 theme](.agents/references/frontend-architecture.md#design-system과-theme) | `.agents/skills/dix-admin-ui/SKILL.md`      |
| 소비 제품 기능·화면·Domain 추가          | [아키텍처의 소비 기능과 데이터 흐름](.agents/references/frontend-architecture.md#소비-기능과-데이터-흐름)                       | `.agents/skills/dix-admin-feature/SKILL.md` |
| API·schema·Query·Mutation·Business Logic | [소비 기능과 데이터 흐름](.agents/references/frontend-architecture.md#소비-기능과-데이터-흐름)                                  | `.agents/skills/dix-admin-data/SKILL.md`    |
| 검증·변경 전달·회귀 확인                 | [명령과 자동 검증 범위](.agents/references/spec.md#명령)                                                                        | `.agents/skills/dix-admin-verify/SKILL.md`  |
| 아키텍처·toolchain·Skill 변경            | 아키텍처·spec·해당 Skill source                                                                                                 | 변경한 문서와 source verifier를 함께 갱신   |

표의 Skill 경로는 프로젝트 로컬 설치 위치입니다. 작업 시작 시 해당 `SKILL.md`가 있는지 확인하고 읽습니다. 파일이 없으면 설치 상태를 확인하며 전역 Skill·다른 프로젝트의 지침으로 대체하지 않습니다.

## 반드시 지킬 경계

- 역할별 source 경계를 따릅니다. `app`은 조립을 소유하고, `page`·`layout`·`component`는 계약과 공통 기반을 사용합니다. 제품 기능과 Domain model은 소비 프로젝트가 소유합니다. 같은 모듈 내부는 상대 경로, 역할·모듈 경계를 넘으면 `@admin` 공개 API를 사용합니다.
- 제품 API·Domain model·Business Logic은 소비 프로젝트가 소유합니다. Template의 `contract/authentication`은 shell에 표시할 `AuthenticatedUser`와 adapter 상태를 정의하며 제품 계정 model을 대체하지 않습니다. 공통 UI에 backend SDK·제품 role·brand·endpoint를 넣지 않습니다.
- `adminRoutePath` 추가와 실제 `Route` 등록은 함께 수행합니다. Dynamic path는 `generatePath`, mount 경로는 별도 basename으로 둡니다.
- Auth·Permission·Navigation·Brand는 consumer contract에 연결합니다. Unknown capability는 deny하며 UI guard를 backend authorization으로 취급하지 않습니다.
- Design-system component source는 React 19용이며 token/CSS는 framework-neutral entry입니다. External·workspace·embedded provider는 같은 primitive contract를 지킵니다.
- JSX component·Provider는 PascalCase, export Hook은 `useXxx`, 일반 모듈은 kebab-case입니다. 폴더·소유 식별자는 단수형, 컬렉션은 `List`·`Map`·`Set` 접미사를 사용합니다.
- 새 문서·설명은 한국어로 작성하고 코드 식별자·명령·API 원문은 유지합니다. 변경한 source·문서·manifest·lock과 작업 지도를 함께 갱신합니다.

## 검증과 보고

[spec의 명령](.agents/references/spec.md#명령) 중 변경 경계에 해당하는 검증을 실행합니다. Typecheck·test·build, Domain/역할/route source gate, provider·consumer matrix의 결과를 구분합니다. 실패는 원인과 재현 로그를 남기고 고친 뒤 해당 검증을 다시 실행합니다.

문서·Skill 변경은 경로·명령·버전의 실제 존재를 확인합니다. Consumer 프로젝트에 설치할 때 기존 지침을 보존하고 template이 소유한 section만 갱신합니다. Browser UI·network 검증과 hosted CI·배포 결과는 로컬 source/build 증거와 별도로 보고합니다.
