# Source 안내

## 실행 흐름

`src/main.tsx`가 `App.tsx`를 마운트합니다. App은 전달된 consumer를 우선 렌더링하고, consumer가 없으면 development에서 /demo를 분기해 DemoApp 또는 StarterApp을 보여 줍니다. production router와 Shell은 consumer가 조립하며, consumer가 없는 production 실행은 설정 오류를 표시합니다. 세부 계약은 [Frontend 아키텍처](../.agents/references/frontend-architecture.md)를 따릅니다.

## 경로 지도

| 경로                                                       | 책임                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| [app/AGENTS.md](app/AGENTS.md)                             | 앱 entry, route 등록과 development demo 조립         |
| [page/AGENTS.md](page/AGENTS.md)                           | consumer page composition과 loading 상태             |
| [hook/AGENTS.md](hook/AGENTS.md)                           | 재사용 interaction과 browser lifecycle hook          |
| [layout/AGENTS.md](layout/AGENTS.md)                       | Shell·Sidebar·Navigation 조립                        |
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

## 테스트 위치

- Source unit test는 대상 TypeScript 파일 옆에 둡니다. 별도의 전역 test setup이나 tests root를 만들지 않습니다.
- DOM을 사용하는 test 파일은 파일 안에서 jsdom 환경을 선언하고, mount 이후 정리와 fake timer·global stub 복구를 해당 test에서 처리합니다.
- 실제 browser focus, dialog top-layer, layout과 network 동작은 jsdom 증거로 대체하지 않습니다.
