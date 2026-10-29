# Dix Admin 디자인 기준

이 문서는 template이 제공하는 기본 Admin shell, 공통 UI와 상태 표시의 시각·상호작용 기준입니다. 소비 프로젝트는 [브랜드 계약](src/contract/navigation/navigation-contract.ts)의 `AdminBrand.token`으로 제품 색상과 필요한 theme token을 덮어쓸 수 있습니다. 제품별 데이터·권한·업무 규칙은 이 디자인 기준에 포함하지 않습니다.

## 기본 표면과 색상

기본 화면은 밝은 회색 canvas 위에 흰색 surface와 얇은 경계선을 둡니다. 주요 동작에는 파란색을 사용하고, 선택 항목은 옅은 파란색 배경으로 구분합니다. 아래 값은 [tokens.css](src/component/design-system/tokens.css)에 정의된 기본값이며 consumer theme에서 바꿀 수 있습니다.

| 의미             | Token                             | 기본값    |
| ---------------- | --------------------------------- | --------- |
| 페이지 배경      | `--dix-admin-color-canvas`        | `#f7f8fa` |
| 카드·입력 배경   | `--dix-admin-color-surface`       | `#ffffff` |
| 선택·보조 배경   | `--dix-admin-color-surface-muted` | `#eef2fb` |
| 기본 본문        | `--dix-admin-color-text`          | `#1a1a1a` |
| 보조 본문        | `--dix-admin-color-text-muted`    | `#636363` |
| 경계선           | `--dix-admin-color-border`        | `#e8eaee` |
| 주요 동작        | `--dix-admin-color-primary`       | `#024ad8` |
| 주요 동작 hover  | `--dix-admin-color-primary-hover` | `#023eb4` |
| 선택·강조 글자   | `--dix-admin-color-primary-ink`   | `#0e3191` |
| 오류·파괴적 동작 | `--dix-admin-color-danger`        | `#b3262b` |
| 성공 상태        | `--dix-admin-color-success`       | `#176b46` |
| 경고 상태        | `--dix-admin-color-warning`       | `#855b06` |
| 키보드 focus     | `--dix-admin-color-focus`         | `#024ad8` |

새 색상은 우선 추가하지 말고 의미에 맞는 token을 사용합니다. consumer가 브랜드 색을 바꾸면 primary·hover·ink·on-primary·focus 상태를 함께 확인합니다. `.dix-admin-theme` 아래에 적용되는 의미 token을 직접 사용하고, 개별 component의 CSS에 브랜드 색을 고정하지 않습니다.

## 글자·간격·모서리

- 기본 글꼴은 Pretendard Variable을 우선하고 운영체제별 sans-serif 글꼴을 대체 글꼴로 사용합니다.
- 기본 글자 크기는 14px, 줄 높이는 1.5, 자간은 -0.01em입니다. 제목·라벨·보조 문구는 역할에 맞춰 크기와 굵기를 구분하고, 수치에는 tabular 숫자 정렬을 적용합니다.
- 간격 token은 `space-1` 4px, `space-2` 8px, `space-3` 12px, `space-4` 16px, `space-6` 24px, `space-8` 32px입니다.
- 모서리 token은 `radius-sm` 6px, `radius-md` 8px, `radius-lg` 10px, `radius-xl` 14px입니다. pill 형태가 필요한 배지·진행 막대는 해당 component에서 둥근 모서리를 사용합니다.
- 기본 동작 전환은 200ms입니다. `prefers-reduced-motion: reduce`에서는 불필요한 애니메이션을 끕니다.

## Shell과 반응형 동작

[shell.css](src/style/shell.css)는 shell의 실제 기준입니다.

| 화면 폭     | Sidebar                  | Main content                                 |
| ----------- | ------------------------ | -------------------------------------------- |
| 1361px 이상 | 왼쪽 고정, 232px         | 왼쪽 여백 232px, 상단 24px·가로 32px padding |
| 721–1360px  | 왼쪽 고정, 208px         | 왼쪽 여백 208px, 상단 24px·가로 24px padding |
| 720px 이하  | 문서 흐름 안의 상단 탐색 | 왼쪽 여백 제거, 상단 20px·가로 16px padding  |

Desktop sidebar는 자체 세로 스크롤을 가지며 main content와 겹치지 않습니다. Mobile에서는 navigation을 줄 바꿈 가능한 가로 메뉴로 전환합니다. 화면별 표·카드 breakpoint는 사용하는 page stylesheet에 정의하고, 기본 breakpoint에 맞추기 위해 기존 콘텐츠의 측정값을 임의로 바꾸지 않습니다.

개발 dashboard 예시는 [demo-dashboard.css](src/page/demo/demo-dashboard.css)에 있으며 화면 너비 1050px 이하에서 요약 카드와 차트를 재배치하고, 720px 이하에서 요약 카드를 한 열로 표시합니다. 이 dashboard는 layout 예시이며 실제 제품 지표나 API를 제공하지 않습니다.

## 공통 UI 공개 범위

| 역할          | 공개 UI                                                                                                                                                                   | 사용 목적                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Design system | `Button`, `Input`, `Badge`, `Skeleton`                                                                                                                                    | provider를 교체할 수 있는 기본 primitive. 공개 진입점은 [design-system/index.ts](src/component/design-system/index.ts)입니다. |
| 재사용 UI     | `AsyncState`, `ChipInput`, `Combobox`, `DataTable`, `DetailList`, `Dropzone`, `FormField`, `PendingButton`, `RemovableChip`, `SegmentedControl`, `StatCard`, `Breadcrumb` | 제품 데이터와 업무 판단을 주입받아 표시하는 고수준 UI. 공개 진입점은 [ui/index.ts](src/component/ui/index.ts)입니다.          |
| Overlay       | `OverlayProvider`, `useOverlay`, `openModal`, `showToast`                                                                                                                 | modal·toast의 host와 상호작용. 공개 진입점은 [overlay/index.ts](src/component/overlay/index.ts)입니다.                        |
| Shell         | `AdminShell`, `Sidebar`, `Navigation`                                                                                                                                     | 브랜드·인증·권한·navigation adapter를 연결하는 공통 admin frame.                                                              |

공통 component는 backend 호출, 제품 API, 제품 role 또는 제품 Domain model을 소유하지 않습니다. 제품별 스타일은 consumer stylesheet와 theme token에서 보완합니다.

### Skeleton

`Skeleton`은 design-system facade로 내보내며 `line`, `block`, `circle`, `bar` 모양을 지원합니다. `className`으로 사용처별 너비·높이를 정하고 `animationDelay`는 순차 표시가 필요한 경우에만 사용합니다. 현재 embedded 기본 스타일은 1.6초 pulse이며 reduced-motion 환경에서는 움직임을 끕니다. component는 보조 기술에 반복 노출되지 않도록 `aria-hidden`으로 렌더링됩니다.

서버에서 받아올 값이나 실제 콘텐츠 영역이 준비되는 동안만 사용합니다. 페이지 제목·고정 label·동작 버튼을 skeleton으로 대체하지 말고, 가능하면 로딩 전후의 크기를 맞춰 layout shift를 줄입니다.

```tsx
import { Skeleton } from "@admin/component/design-system";

<div aria-busy="true">
	<Skeleton shape="line" className="summary-label" />
	<Skeleton shape="block" className="summary-card" />
</div>;
```

### Modal과 toast

각 `.dix-admin-theme` 내부에 `OverlayProvider`를 한 번 두고 그 아래 component에서 `useOverlay`를 사용합니다. Provider가 token을 상속하는 portal host와 `overlay.css`를 관리하므로 별도 body portal이나 임의 overlay host를 추가하지 않습니다.

```tsx
import { useOverlay } from "@admin/component/overlay";

const SaveAction = () => {
	const { openModal, showToast } = useOverlay();

	return (
		<>
			<button
				type="button"
				onClick={() =>
					openModal({
						title: "변경 내용을 확인하세요",
						description: "저장 전에 변경 사항을 다시 확인합니다.",
						content: <p>이 작업을 계속할까요?</p>,
					})
				}
			>
				확인 모달
			</button>
			<button
				type="button"
				onClick={() =>
					showToast({
						message: "변경 사항을 저장했습니다.",
						tone: "success",
					})
				}
			>
				저장 알림
			</button>
		</>
	);
};
```

- Modal은 native `<dialog>`를 사용합니다. `title`은 필수이며 `description`, `content`, `footer`, `isPending`을 설정할 수 있습니다. 열 때 focus를 dialog로 이동하고 닫힐 때 호출 요소로 복원합니다. Escape·Tab focus 순환과 body scroll lock을 처리합니다. `isPending` 동안은 닫기·교체 요청을 막습니다.
- Toast는 `info | success | error` tone을 지원하고 기본 4초 뒤 사라집니다. `durationMs: 0`이면 직접 닫을 때까지 유지합니다. 오류는 `alert`, 나머지는 `status` live region으로 노출하며 닫기 버튼을 제공합니다.
- Modal과 toast가 함께 표시되면 하나의 toast host를 modal top layer 안에서 유지해 알림이 가려지지 않게 합니다.

두 API는 [overlay 테스트](src/component/overlay/modal.test.tsx), [toast 테스트](src/component/overlay/toast.test.tsx), provider·token 테스트에서 검증합니다. Native dialog의 실제 browser top layer·화면 배치와 소비 프로젝트의 실제 theme 적용은 브라우저에서 별도로 확인합니다.

## 접근성·확장 기준

- 동작 요소는 의미 있는 HTML과 보이는 `:focus-visible` 표시를 사용합니다. 선택 상태는 `aria-current`, `aria-pressed`처럼 상태에 맞는 속성으로 전달합니다.
- 입력 label·오류 설명, dialog 이름·설명, toast live region을 연결합니다. 색상만으로 선택·오류·성공을 구분하지 않습니다.
- `disabled`, `pending`, `aria-busy`는 실제 가능한 동작과 일치하게 유지합니다.
- 외부 DesignSystemProvider도 embedded와 같은 `Button`·`Input`·`Badge`·`Skeleton` prop contract를 지킵니다. 외부 provider CSS는 consumer가 명시적으로 import합니다.
- Theme root는 `.dix-admin-theme`, token은 `--dix-admin-*`를 사용합니다. CSS-only consumer는 [styles.css](src/component/design-system/styles.css)와 필요한 shell·UI CSS를 별도로 import할 수 있습니다.
