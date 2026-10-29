# 디자인 시스템

이 문서는 이 저장소의 실제 Tailwind theme와 공통 컴포넌트를 사용하는 기준입니다. 에이전트는 새 화면을 만들기 전에 여기서 해당 역할의 컴포넌트를 찾아 조합하고, 화면에 필요한 데이터·상태·동작만 소비 프로젝트에서 연결합니다. 기본 theme와 컴포넌트 계약의 source는 [`src/style/tailwind.css`](src/style/tailwind.css)와 아래 표의 각 파일입니다.

## 적용 원칙

- 앱은 [`src/style/tailwind.css`](src/style/tailwind.css)를 한 번 불러옵니다. Tailwind CSS 4의 theme token을 `@theme`에 선언하며, 화면과 component의 표현은 JSX `className` 유틸리티로 작성합니다.
- component별 `.css` 파일, `style` 태그, `@apply`를 추가하지 않습니다. 전역 폰트·theme token·keyframes·Tailwind 진입점만 `src/style/tailwind.css`에 둡니다.
- 기본 구현은 밝은 canvas, 흰 surface, 얇은 경계, 파란 primary를 사용합니다. 제품 브랜드는 Shell의 `Brand.token`으로 theme 변수를 덮어씁니다.
- 기존 공통 컴포넌트와 prop 계약을 먼저 사용합니다. 표에 없는 variant나 동작을 이미 제공하는 것처럼 가정하지 않습니다. 새 공통 API가 실제로 필요하면 source·검증·이 문서를 함께 변경합니다.
- 폴더와 소유 식별자는 단수형을 사용하고 컬렉션 prop은 `itemList`, `rowList`, `optionList`처럼 `List`로 끝냅니다.

## 색상

아래 값은 [`tailwind.css`](src/style/tailwind.css)의 기본값입니다. 클래스에서는 `bg-canvas`, `text-text-muted`, `border-border`, `text-negative`와 같이 사용합니다. secondary·tertiary는 색상 분류용 alias이며 버튼 variant의 이름을 뜻하지 않습니다.

| 분류      | Tailwind token   | 기본값               | 쓰임                                  |
| --------- | ---------------- | -------------------- | ------------------------------------- |
| Primary   | `primary`        | `#024ad8`            | 주요 동작, 선택 강조, 포커스          |
| Primary   | `primary-hover`  | `#023eb4`            | primary 동작의 포인터 hover           |
| Primary   | `primary-soft`   | `#eef2fb`            | 선택된 메뉴·부드러운 강조 배경        |
| Primary   | `primary-strong` | `#0e3191`            | 선택된 메뉴 글자, dashboard 그래프    |
| Primary   | `primary-deep`   | `#071c52`            | 어두운 브랜드 표면과 overlay 기준색   |
| Primary   | `on-primary`     | `#ffffff`            | primary 배경 위 글자                  |
| Secondary | `secondary`      | `#0e3191`            | primary-strong과 같은 보조 강조 alias |
| Tertiary  | `tertiary`       | `#eef2fb`            | primary-soft와 같은 약한 강조 alias   |
| Grayscale | `canvas`         | `#f7f8fa`            | 앱 바깥과 페이지 배경                 |
| Grayscale | `surface`        | `#ffffff`            | 카드, 입력, modal, toast 배경         |
| Grayscale | `surface-muted`  | `#eef2fb`            | 보조 표면, skeleton, 선택 행          |
| Grayscale | `text`           | `#1a1a1a`            | 본문과 제목                           |
| Grayscale | `text-secondary` | `#3d3d3d`            | 한 단계 낮은 강조 텍스트              |
| Grayscale | `text-muted`     | `#636363`            | 설명, 표 머리글, 부가 정보            |
| Grayscale | `text-subtle`    | `#a8a8a8`            | placeholder와 낮은 강조 텍스트        |
| Grayscale | `border`         | `#e8eaee`            | 카드·입력·표 경계                     |
| Grayscale | `border-strong`  | `#d3d7de`            | 더 뚜렷한 구분선                      |
| Positive  | `positive`       | `#176b46`            | 성공 상태와 성공 toast 경계           |
| Negative  | `negative`       | `#b3262b`            | 오류·파괴적 동작·오류 상태            |
| Negative  | `on-negative`    | `#ffffff`            | negative 배경 위 글자                 |
| 상태      | `warning`        | `#855b06`            | 주의 상태                             |
| 상태      | `focus`          | `#024ad8`            | 키보드 focus outline                  |
| 상태      | `backdrop`       | `rgb(7 28 82 / 55%)` | modal 뒤 화면                         |

현재 primitive의 `Button` variant는 `primary`, `secondary`, `danger`입니다. `secondary` 버튼은 흰 surface와 border를 사용하는 중립 버튼이고, `danger`는 negative 색을 사용합니다. `tertiary` 버튼 variant는 없습니다. `Badge`의 실제 tone은 `neutral`, `success`, `warning`, `danger`입니다.

## 타이포그래피

글꼴은 `Pretendard Variable`, `Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `Apple SD Gothic Neo`, `Segoe UI`, `Roboto`, `Noto Sans KR`, `sans-serif` 순서입니다. `font-sans`가 이 stack을 사용합니다.

| Tailwind text token | 크기 | Shell의 기본 line-height | 주 사용처              |
| ------------------- | ---: | -----------------------: | ---------------------- |
| `text-caption`      | 12px |                     18px | 작은 badge, 표 머리글  |
| `text-meta`         | 13px |                   19.5px | 설명, hint, 부가 정보  |
| `text-body`         | 14px |                     21px | 기본 본문, 입력, 버튼  |
| `text-subtitle`     | 15px |                   22.5px | 카드·섹션 제목         |
| `text-label`        | 16px |                     24px | 강조 label과 보조 수치 |
| `text-dialog-title` | 20px |                     30px | Modal 제목             |
| `text-page-title`   | 24px |                     36px | 페이지 제목            |
| `text-metric`       | 40px |                     60px | 지표 수치 token        |

기본 line-height는 Shell의 단위 없는 `1.5`에서 계산했습니다. 크기 token은 weight와 letter-spacing을 고정하지 않으며, 현재 공통 구현의 명시 규칙은 다음과 같습니다.

| 텍스트 역할       | Weight | Line-height | Letter-spacing | 적용 예                                            |
| ----------------- | -----: | ----------: | -------------: | -------------------------------------------------- |
| Shell 기본 본문   |    400 |         1.5 |      `-0.01em` | 페이지 전반의 기본 글자                            |
| Input             |    400 |         1.5 |           상속 | primitive Input 본문                               |
| Button            |    600 |         1.5 |           상속 | primitive Button 본문                              |
| 보조 label·badge  |    600 |         1.5 |           상속 | FormField label, Badge, SegmentedControl 선택 항목 |
| 페이지 제목       |    700 |         1.5 |           상속 | 기본 페이지 heading                                |
| dashboard 제목    |    700 |         1.5 |      `-0.03em` | Demo dashboard의 page title                        |
| 카드·section 제목 |    600 |         1.5 |      `-0.02em` | Demo dashboard panel title                         |
| 지표 수치         |    700 |         1.1 |           상속 | StatCard: 40px / 44px, 숫자 정렬은 `tabular-nums`  |
| Modal 제목        |    600 |         1.5 |           상속 | Modal의 20px 제목                                  |

button·label·badge 제목은 명시적으로 `font-semibold`(600), 페이지 제목과 지표 수치는 `font-bold`(700)를 사용합니다. Shell 기본은 `font-normal`(400)입니다. 표의 상속 값은 Shell 안에 렌더링될 때 적용되며, 독립 mount되는 UI는 소비 앱의 상위 typography를 따릅니다. 공통 컴포넌트 source에서 다른 leading·tracking을 지정하면 해당 값이 우선합니다.

## 간격·크기·모서리

Tailwind 기본 spacing scale은 4px 단위입니다. 이 source에서 자주 쓰는 간격은 4, 6, 8, 10, 12, 14, 16, 20, 24, 32px입니다. 예를 들어 `gap-2`·`p-3`·`px-4`·`p-6`·`gap-8`은 각각 8·12·16·24·32px입니다. 임의 값은 기존 shell·dashboard 측정치나 의미 있는 컴포넌트 치수가 spacing scale에 없을 때만 사용합니다.

| Token          |     값 | 주요 사용                  |
| -------------- | -----: | -------------------------- |
| `rounded-sm`   |    6px | 작은 chip, badge, option   |
| `rounded-md`   |    8px | button, input, menu, toast |
| `rounded-lg`   |   10px | modal                      |
| `rounded-xl`   |   14px | StatCard, dashboard panel  |
| `rounded-pill` | 9999px | chip과 capsule             |

Button과 Input은 최소 높이 40px입니다. Sidebar는 넓은 화면에서 232px, 1360px 이하에서 208px입니다. Modal은 `min(32rem, calc(100vw - 2rem)` 너비와 `calc(100dvh - 2rem)` 최대 높이를 사용합니다. Toast host 최대 너비는 `min(26rem, calc(100vw - 2rem))`입니다.

## Shell 반응형 규격

구현은 [`Shell.tsx`](src/layout/Shell.tsx), [`Sidebar.tsx`](src/layout/Sidebar.tsx), [`Navigation.tsx`](src/layout/Navigation.tsx)에 있습니다.

| 화면 폭     | Sidebar                               | 본문                                           |
| ----------- | ------------------------------------- | ---------------------------------------------- |
| 1361px 이상 | 왼쪽 고정, 232px                      | 왼쪽 여백 232px, 상단 24px·좌우 32px·하단 96px |
| 721–1360px  | 왼쪽 고정, 208px                      | 왼쪽 여백 208px, 좌우 24px                     |
| 720px 이하  | 일반 문서 흐름의 상단 탐색, 너비 100% | 왼쪽 여백 제거, 상단 20px·좌우 16px·하단 64px  |

인쇄에서는 Sidebar와 skip link를 숨기고 본문 margin·padding을 제거합니다. `Shell`은 `data-theme-root`로 theme 경계를 표시하고 `Brand.token`을 해당 root의 inline custom property로 적용합니다. `OverlayProvider`는 이 root 안에 두어 modal과 toast가 같은 theme를 상속하게 합니다.

개발 dashboard는 [`DemoDashboardPage.tsx`](src/page/demo/DemoDashboardPage.tsx)에 있으며 제품 화면이 아닙니다. 요약 카드는 기본 3열, 1050px 이하 2열, 720px 이하 1열입니다. 차트 영역은 기본 1.6:0.8 열 비율, 1050px 이하 1열입니다. 목록·막대 차트·패널의 간격과 typography는 해당 page의 Tailwind class를 기준으로 수정합니다.

로그인 후 Sidebar의 `공통 컴포넌트`를 선택하면 [`DemoComponentPage.tsx`](src/page/demo/DemoComponentPage.tsx)의 `/component` 예시를 확인할 수 있습니다. primitive variant, FormField 오류·hint, Combobox keyboard 선택, Chip 추가·제거, Dropzone 파일 선택, PendingButton·AsyncState 전환, DataTable 선택·pending·empty, Modal·Toast를 로컬에서 조작합니다. 제품 데이터 전송은 하지 않습니다. Breadcrumb·Shell·Navigation은 이 route와 페이지 바깥 공통 shell에서 확인합니다.

## 실제 컴포넌트 목록

아래는 저장소에 현재 존재하는 공통 source입니다. 화면을 만들 때 제품 업무 데이터와 callback을 주입해 조합합니다. 폴더는 역할 경계이며 `index.ts` barrel은 두지 않으므로 명시된 파일에서 직접 import합니다.

### Design-system primitive

| 컴포넌트               | Source                                                                                                                              | 실제 계약                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`               | [`component/ui/Button.tsx`](src/component/ui/Button.tsx), [`design-system-contract.ts`](src/component/ui/design-system-contract.ts) | native button props와 `variant?: primary \| secondary \| danger`; 기본 variant는 primary, 기본 type은 button. disabled·focus 상태를 지원합니다.                          |
| `Input`                | [`component/ui/Input.tsx`](src/component/ui/Input.tsx)                                                                              | native input props 전체를 전달합니다. 기본 높이 40px, `aria-invalid="true"`, disabled, placeholder, focus 상태를 처리합니다.                                             |
| `Badge`                | [`component/ui/Badge.tsx`](src/component/ui/Badge.tsx)                                                                              | span props와 `tone?: neutral \| success \| warning \| danger`; 기본은 neutral입니다.                                                                                     |
| `Skeleton`             | [`component/ui/Skeleton.tsx`](src/component/ui/Skeleton.tsx)                                                                        | `shape?: line \| block \| circle \| bar`, `className`, `animationDelay`(ms). 기본은 line, 장식 요소로 `aria-hidden`입니다. reduced-motion에서는 애니메이션을 중단합니다. |
| `DesignSystemProvider` | [`component/ui/DesignSystemProvider.tsx`](src/component/ui/DesignSystemProvider.tsx)                                                | subtree에 `embedded`, `workspace`, `external` primitive 구현을 제공합니다. Provider map은 Button·Input·Badge·Skeleton 네 개로 고정합니다.                                |

Embedded 기본 구현은 [`component/ui/embedded/`](src/component/ui/embedded/EmbeddedButton.tsx)에 있습니다. 외부·workspace provider도 [`design-system-contract.ts`](src/component/ui/design-system-contract.ts)의 같은 props를 지켜야 하며 Tailwind를 사용하는 소비 프로젝트는 provider package source를 Tailwind 탐색 범위에 포함해야 합니다.

### 입력·상태·데이터 표시

| 컴포넌트           | Source                                                          | 실제 용도·상태                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormField`        | [`FormField.tsx`](src/component/ui/FormField.tsx)               | label과 입력을 연결하고 선택 hint·error·required 표시를 배치합니다. 입력에는 일치하는 `id`와 error/hint 연결을 소비자가 설정합니다.                                 |
| `Combobox`         | [`Combobox.tsx`](src/component/ui/Combobox.tsx)                 | 단일 선택 autocomplete. `optionList`, `value`, `inputValue`, `onInputChange`, `onChange`를 받습니다. 방향키·Enter·Escape·disabled option·빈 목록 표시를 처리합니다. |
| `ChipInput`        | [`ChipInput.tsx`](src/component/ui/ChipInput.tsx)               | `valueList` chip과 주입된 `input`을 합성합니다. 제거는 `onRemoveValue(value)`로 전달하며 `hasError`, `disabled`를 받습니다.                                         |
| `RemovableChip`    | [`RemovableChip.tsx`](src/component/ui/RemovableChip.tsx)       | label·삭제 accessible name·선택적 title을 표시하고 disabled 제거 버튼을 제공합니다.                                                                                 |
| `SegmentedControl` | [`SegmentedControl.tsx`](src/component/ui/SegmentedControl.tsx) | `optionList`, `value`, `onChange`를 사용하는 radio 기반 단일 선택입니다. option별 disabled를 지원합니다.                                                            |
| `Dropzone`         | [`Dropzone.tsx`](src/component/ui/Dropzone.tsx)                 | 파일 선택과 drag/drop. `accept`, `multiple`, `disabled`, `hint`, `onFileChange(fileList)`를 받습니다.                                                               |
| `PendingButton`    | [`PendingButton.tsx`](src/component/ui/PendingButton.tsx)       | primitive Button에 `pending` 표시·spinner·`aria-busy`를 추가합니다. pending 동안 disabled입니다.                                                                    |
| `AsyncState`       | [`AsyncState.tsx`](src/component/ui/AsyncState.tsx)             | `loading`, `empty`, `error`, `success` 상태별 콘텐츠를 렌더링합니다. loading은 status/busy, error는 alert 역할입니다.                                               |
| `DataTable`        | [`DataTable.tsx`](src/component/ui/DataTable.tsx)               | caption·row/column 목록·row key를 받는 semantic table. 선택 checkbox, 전체 선택, pending, empty 상태를 지원합니다.                                                  |
| `DetailList`       | [`DetailList.tsx`](src/component/ui/DetailList.tsx)             | 정의 목록 형태의 label/value 행. 600px 이하에서 열 비율과 padding을 줄입니다.                                                                                       |
| `StatCard`         | [`StatCard.tsx`](src/component/ui/StatCard.tsx)                 | label·value·선택 detail을 표시하는 지표 카드. `className`으로 카드 배치에 맞게 확장할 수 있습니다.                                                                  |

### Breadcrumb

[`component/ui/breadcrumb/`](src/component/ui/breadcrumb/Breadcrumb.tsx)는 `BreadcrumbProvider`, `BreadcrumbSlot`, `Breadcrumb`으로 구성됩니다. Route 화면에서 Provider에 breadcrumb state를 제공하고 Shell의 slot에서 출력합니다. 마지막 항목은 현재 페이지로 표시하며, 이동 항목은 router가 주입하는 `renderLink`를 사용할 수 있습니다. 직접 접근 시 이 모듈의 각 component 파일에서 import합니다.

### Modal과 Toast

[`OverlayProvider`](src/component/overlay/OverlayProvider.tsx)는 theme root 안에 portal host를 만들고 [`useOverlay`](src/component/overlay/useOverlay.ts)가 `openModal`·`showToast` API를 제공합니다. modal은 native `<dialog>`의 top layer·Escape 처리·focus 복귀/containment을 사용합니다. pending modal은 닫히지 않습니다.

| 기능  | 실제 계약                                                                                                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modal | `{ title, description?, content, footer?, isPending?, closeLabel? }`; 반환 controller는 `close()`와 `update(partialOptions)`입니다. backdrop 클릭과 close button으로 닫으며, 설명이 있으면 accessible description을 연결합니다. |
| Toast | `{ message, tone?: info \| success \| error, durationMs? }`; 반환 controller는 `dismiss()`입니다. `durationMs: 0`은 자동 종료하지 않고, error는 alert, 나머지는 status로 알립니다.                                              |

Overlay 사용 시 별도 body portal이나 별도 host를 만들지 않습니다. `OverlayProvider`를 `data-theme-root` 내부에 한 번 둡니다.

### Shell·Navigation·접근 경계

| 컴포넌트             | Source                                                                                                 | 역할                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Shell`              | [`layout/Shell.tsx`](src/layout/Shell.tsx)                                                             | consumer가 제공한 auth·permission·brand·navigation과 route title을 조립합니다. main landmark, skip link, theme root를 소유합니다. |
| `Sidebar`            | [`layout/Sidebar.tsx`](src/layout/Sidebar.tsx)                                                         | Brand, Navigation, 인증 사용자 표시, 로그인·로그아웃 동작을 표시합니다. 제품 계정 model은 받지 않습니다.                          |
| `Navigation`         | [`layout/Navigation.tsx`](src/layout/Navigation.tsx)                                                   | capability를 통과한 항목과 badge를 렌더링합니다. router link/href/navigate 동작을 consumer가 주입할 수 있습니다.                  |
| `AuthBoundary`       | [`component/authentication/AuthBoundary.tsx`](src/component/authentication/AuthBoundary.tsx)           | consumer `AuthAdapter` 상태를 loading·anonymous·error·authenticated 화면으로 연결합니다. 세션/로그인 구현은 하지 않습니다.        |
| `CapabilityBoundary` | [`component/authorization/CapabilityBoundary.tsx`](src/component/authorization/CapabilityBoundary.tsx) | 등록된 capability의 consumer 판정을 화면 경계에 적용합니다. backend authorization을 대체하지 않습니다.                            |

`authentication`과 `authorization`은 템플릿 제품 기능이 아니라 consumer adapter contract를 화면에 반영하는 경계입니다. 계정 schema·role 체계·인증 SDK·API는 소비 프로젝트의 책임입니다. 인증이 완료되지 않은 콘텐츠를 노출하지 않도록 기본 상태를 닫힌 상태로 둡니다.

Sidebar 위쪽은 `Brand.title` 왼쪽에 선택 `Brand.logo`를 표시합니다. 소비자는 SVG 등 React element를 `Brand.logo`로 전달해 브랜드를 교체할 수 있고, [`DemoBrandLogo`](src/app/demo/DemoBrandLogo.tsx)에서 예시 형태를 볼 수 있습니다. Sidebar 아래쪽은 프로필을 왼쪽, 로그아웃 버튼을 오른쪽에 정렬합니다. 사용자 이름과 설명이 좁은 영역을 넘으면 한 줄 말줄임으로 표시합니다.

### 재사용 Hook

- [`useSelection`](src/hook/useSelection.ts): 행 key와 선택 key 목록을 기반으로 개별/전체 선택 상태를 계산합니다.
- [`usePendingNavigation`](src/hook/usePendingNavigation.ts): pending 상태에서 navigation 중복 실행을 막습니다.
- [`useStickyTableHeader`](src/hook/useStickyTableHeader.ts)와 [`useObservedElementHeight`](src/hook/useObservedElementHeight.ts): 관찰한 크기에 맞춰 표 header 위치를 조정합니다.
- [`useSectionNavigation`](src/hook/useSectionNavigation.ts): section ID 목록과 offset 기준으로 현재 section 이동을 관리합니다.

## 조합과 import

다른 역할을 사용하는 화면은 구체 파일을 `@/` alias로 import합니다. 같은 모듈 내부 import는 상대 경로를 사용합니다.

```tsx
import { AsyncState } from "@/component/ui/AsyncState";
import { DataTable } from "@/component/ui/DataTable";
import { FormField } from "@/component/ui/FormField";
import { Input } from "@/component/ui/Input";
import { StatCard } from "@/component/ui/StatCard";

<FormField label="검색어" htmlFor="query">
	<Input id="query" name="query" />
</FormField>

<AsyncState state={state} loading={<p>불러오는 중</p>} empty={<p>결과 없음</p>} error={<p>다시 시도해 주세요</p>}>
	<DataTable caption="결과" rowList={rowList} columnList={columnList} rowKey={(row) => row.id} />
</AsyncState>

<StatCard label="활성 계정" value={activeCount} detail="최근 7일" />
```

여기서 `state`, `rowList`, `columnList`, `activeCount`는 소비 화면의 데이터입니다. 컴포넌트는 해당 제품의 API·권한·저장 규칙을 추측하지 않습니다.
