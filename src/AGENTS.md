# Source 안내

## 실행 흐름

`src/main.tsx`가 `App.tsx`를 마운트합니다. 앱은 consumer 구성을 받아 production router와 Shell을 조립하고, 개발 환경에서는 별도 demo 앱을 지연 로드합니다. 세부 계약은 [Frontend 아키텍처](../.agents/references/frontend-architecture.md)를 따릅니다.

## 경로 지도

| 경로                                                       | 책임                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| [app/AGENTS.md](app/AGENTS.md)                             | 앱 entry, route 등록과 development demo 조립         |
| [page/AGENTS.md](page/AGENTS.md)                           | consumer page composition과 loading 상태             |
| [component/AGENTS.md](component/AGENTS.md)                 | 재사용 UI와 화면 경계 component                      |
| [component/ui/AGENTS.md](component/ui/AGENTS.md)           | 디자인 시스템과 공통 UI 사용법                       |
| [component/overlay/AGENTS.md](component/overlay/AGENTS.md) | Modal·Toast 상태와 표현                              |
| [page/demo/AGENTS.md](page/demo/AGENTS.md)                 | 데모 화면과 로컬 예시 상태                           |
| `contract/`                                                | 인증·권한·navigation consumer adapter 계약           |
| `hook/`                                                    | 재사용 가능한 React interaction과 브라우저 상태 hook |
| `layout/`                                                  | Shell·Sidebar·Navigation 조립                        |
| `route/`                                                   | 공개 route path builder                              |
| `style/`                                                   | Tailwind CSS entry와 전역 token/base 설정            |

## 경계

- 제품 API, 제품 Domain model, 실제 권한 판단은 소비 프로젝트에 둡니다. Template UI는 adapter가 제공한 상태를 화면에 반영합니다.
- component와 page 인접 CSS를 추가하지 않습니다. 화면 스타일은 Tailwind utility로 작성하고 전역 CSS는 `style/`의 단일 entry에서 관리합니다.
- 역할 간 공개 import와 route 계약은 아키텍처 문서를 따릅니다. 새 `index.ts` barrel을 만들지 않습니다. 외부 package fixture의 실제 entrypoint는 예외입니다.
- Route를 추가할 때 path, route contract, explicit registration, handle metadata, 개발용 route map과 demo navigation이 일치하는지 확인합니다.
