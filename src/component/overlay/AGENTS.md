# Overlay 안내

## 구성

- `OverlayProvider`는 Modal·Toast 상태를 소유하고 overlay theme root와 portal host를 연결합니다.
- `ModalView`와 `useDialogLifecycle`은 native dialog의 열기·닫기, Escape, focus 이동·복귀, body scroll lifecycle을 처리합니다.
- `ToastView`는 provider가 관리하는 알림을 화면에 표시합니다. 호출 API와 variant 규격은 [DESIGN.md](../../../DESIGN.md)를 기준으로 합니다.
- `useOverlay`와 `overlay-contract.ts`는 소비 API와 상태 계약을 정의합니다. `dialog-focus.ts`는 focus 처리를 분리합니다.

## 변경 규칙

- Modal 상태·닫기·focus 동작을 바꾸면 Escape, 닫기 버튼, focus 복귀, body scroll 복구를 각각 검증합니다.
- Toast 추가·닫기·자동 만료·variant를 바꾸면 provider 상태와 view를 같이 확인합니다. 성공·오류 색과 모양은 공통 Badge의 색 의미를 임의로 재정의하지 않습니다.
- 테스트 전용 dialog stub은 browser top-layer나 실제 focus 동작을 증명하지 않습니다. native dialog와 stacking을 확인할 때는 브라우저 검증 결과를 별도로 기록합니다.
- Overlay와 demo 화면의 CSS는 Tailwind utility로 작성하며 component 옆 CSS 파일을 만들지 않습니다.
