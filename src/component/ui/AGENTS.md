# UI Component 안내

## 구성

- `Button`, `Input`, `Badge`, `Skeleton`은 provider facade입니다. 기본 embedded 구현은 바로 사용할 수 있고, consumer가 교체할 때 `DesignSystemProvider`로 구현을 주입합니다.
- 공통 UI와 디자인 시스템 component는 이 폴더에 둡니다. 전체 variant·token·상태·사용 예시는 [DESIGN.md](../../../DESIGN.md)에서 확인합니다.
- form 입력에는 `FormField`, `Combobox`, `ChipInput`, `ChipSelect`, `SegmentedControl`, `Dropzone`을 조합합니다.
- data display에는 `DataTable`, `DetailList`, `StatCard`, `HorizontalBar`, `HorizontalBarChart`, `VerticalBar`, `VerticalBarChart`를 사용합니다. 그래프 primitive와 완성형 차트 template의 차이도 DESIGN 문서에 기록합니다.
- 비동기·feedback UI에는 `AsyncState`, `PendingButton`, `RemovableChip`, `SectionRail`을 사용합니다. Breadcrumb 구현은 `breadcrumb/`에 둡니다.

## 구현 규칙

- Component와 page style은 Tailwind CSS utility로 작성합니다. 인접 `.css` 파일이나 CSS module을 추가하지 않습니다. 전역 token과 base style만 `src/style/tailwind.css`에서 관리합니다.
- 반복 UI는 기존 공통 component를 먼저 조합합니다. 새 variant나 primitive는 제품 전용 규칙을 끌어오지 않고 provider contract와 `DESIGN.md`를 함께 갱신합니다.
- Provider facade의 공개 prop·동작을 바꾸면 embedded 구현, mode verifier, consumer 예제와 해당 component test를 함께 확인합니다.
- Browser 전용 상호작용과 keyboard/focus contract는 실제 browser 확인 대상입니다. jsdom test 성공만으로 browser 동작을 주장하지 않습니다.
- `fixture/provider-package/index.js`와 `index.d.ts`는 package consumer 검증용 entrypoint라 유지합니다. 일반 module용 `index.ts` barrel은 만들지 않습니다.
