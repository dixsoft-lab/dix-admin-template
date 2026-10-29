# 공통 Component 안내

## 경로 지도

| 경로              | 책임                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `ui/`             | Button, Input, Badge, Skeleton facade와 재사용 form·table·chart UI. 상세는 [UI 안내](ui/AGENTS.md). |
| `overlay/`        | OverlayProvider, Modal, Toast와 keyboard/focus lifecycle. 상세는 [Overlay 안내](overlay/AGENTS.md). |
| `authentication/` | consumer 인증 adapter 상태를 표시하는 AuthBoundary                                                  |
| `authorization/`  | capability 결과를 UI에 반영하는 CapabilityBoundary                                                  |
| `metadata/`       | document title context와 화면 metadata 연결                                                         |

공통 UI의 시각 규격과 구현된 component 목록은 [디자인 시스템](../../DESIGN.md)을 기준으로 합니다. 이 문서는 source 책임을 안내하고 디자인 규격을 복제하지 않습니다.

## 경계

- Authentication·Authorization component는 adapter 결과를 표시하는 UI 경계입니다. 제품 session, account model, 실제 권한 검증을 구현하지 않습니다.
- 공통 component에 제품명·제품별 route·API·business rule을 넣지 않습니다. 소비 제품의 동작이 필요하면 명시적인 prop 또는 adapter 계약으로 연결합니다.
- React component는 해당 책임 폴더에 둡니다. 다른 module이 재사용하는 hook은 component 파일에서 export하지 않고 `src/hook/`에 독립 파일로 둡니다.
