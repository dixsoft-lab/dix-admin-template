# 디자인 시스템

이 문서는 현재 저장소에 구현된 디자인 token과 공통 컴포넌트의 사용 설명서입니다. 에이전트는 화면을 추가할 때 아래 component 목록에서 먼저 맞는 항목을 선택하고, 제품 데이터·업무 규칙·API는 소비 프로젝트가 연결합니다. 각 규격의 기준 source는 [Tailwind theme](src/style/tailwind.css)와 해당 component 파일입니다.

## 적용 원칙

- 모든 화면 스타일은 Tailwind CSS utility class로 작성합니다. Component 옆 CSS 파일, style tag, @apply는 추가하지 않습니다.
- 전역 Tailwind 진입점, token, keyframes는 [src/style/tailwind.css](src/style/tailwind.css)에만 둡니다.
- Source에 구현되지 않은 variant나 동작을 문서에 적지 않습니다. 공통 동작이 더 필요하면 component source, 검증, 이 문서를 함께 갱신합니다.
- 같은 component 역할의 공개 API는 [src/component/ui](src/component/ui) 아래 구체 파일에서 직접 import합니다. index.ts barrel은 만들지 않습니다.
- 폴더와 역할 이름은 단수형을 씁니다. 배열 prop은 itemList, rowList, optionList처럼 List 접미사를 사용합니다.
- 아래의 예시 페이지는 component 동작 확인용입니다. 제품 API나 저장 요청을 호출하지 않습니다.

## 색상

기본 color 값은 [src/style/tailwind.css](src/style/tailwind.css)의 @theme에서 정의합니다. 소비 앱은 Shell의 Brand.token으로 필요한 token을 재정의할 수 있습니다.

| 분류             | Tailwind token   | 기본값             | 사용                                |
| ---------------- | ---------------- | ------------------ | ----------------------------------- |
| Primary          | primary          | #024ad8            | 주요 동작과 입력 focus              |
| Primary hover    | primary-hover    | #023eb4            | 주요 버튼 hover                     |
| Primary soft     | primary-soft     | #eef2fb            | 선택 메뉴와 부드러운 강조 배경      |
| Primary strong   | primary-strong   | #0e3191            | 칩, 그래프와 진행 막대              |
| Primary deep     | primary-deep     | #071c52            | 어두운 브랜드 배경과 overlay 기준색 |
| Secondary alias  | secondary        | #0e3191            | primary-strong과 같은 보조 강조 색  |
| Tertiary alias   | tertiary         | #eef2fb            | primary-soft와 같은 약한 강조 색    |
| On primary       | on-primary       | #ffffff            | primary 배경 위의 글자              |
| Positive         | positive         | #16794b            | 결제 성공 등 positive 상태와 글자   |
| On positive      | on-positive      | #ffffff            | positive 배경 위의 글자             |
| Warning          | warning          | #8a5a12            | 검수 요청, 초대 대기 같은 주의 상태 |
| Warning surface  | warning-surface  | #fdf3e7            | warning badge의 옅은 배경           |
| Negative         | negative         | #b3262b            | 오류, 삭제, 파괴적 동작             |
| On negative      | on-negative      | #ffffff            | negative 배경 위의 글자             |
| Negative surface | negative-surface | #fbeaea            | 실패·게시 중단 badge의 옅은 배경    |
| Canvas           | canvas           | #f7f8fa            | 어드민 shell과 페이지 배경          |
| Surface          | surface          | #ffffff            | 카드, 입력, modal, toast 배경       |
| Surface muted    | surface-muted    | #eef2fb            | 표 보조 배경과 약한 강조            |
| Text             | text             | #1a1a1a            | 제목과 기본 본문                    |
| Text secondary   | text-secondary   | #3d3d3d            | 보조 강조 문장                      |
| Text muted       | text-muted       | #636363            | 설명, hint, 표 머리글               |
| Text subtle      | text-subtle      | #a8a8a8            | placeholder와 낮은 강조 텍스트      |
| Border           | border           | #e8eaee            | 카드, 표, 구분선                    |
| Border strong    | border-strong    | #d3d7de            | 입력과 선택 control 경계            |
| Focus            | focus            | #024ad8            | 키보드 focus outline                |
| Backdrop         | backdrop         | rgb(7 28 82 / 55%) | modal 뒤 배경                       |

Button의 실제 variant는 primary, secondary, danger입니다. secondary는 흰 surface와 strong border를 사용하는 중립 버튼이며, danger는 투명한 배경에 negative border와 label을 사용합니다. tertiary Button variant는 없습니다. Badge tone은 neutral, primary, success, warning, danger, quiet입니다. secondary와 tertiary color token을 버튼 variant 이름으로 사용하지 않습니다.

## 타이포그래피

모든 화면은 Pretendard Variable, Pretendard, Apple system font, Apple SD Gothic Neo, Segoe UI, Roboto, Noto Sans KR, sans-serif 순으로 렌더링합니다. Pretendard Variable과 Inter는 [Tailwind entry](src/style/tailwind.css)에서 USP Admin과 같은 font file로 불러옵니다. 기본 UI는 `font-sans`, 금액과 숫자 지표는 Inter 우선의 `font-num`을 사용합니다. 로그인 화면도 별도 font stack 없이 공통 `font-sans`를 사용합니다.

| Token             | 크기 | 기본 line-height | 용도                          |
| ----------------- | ---: | ---------------: | ----------------------------- |
| text-caption      | 12px |         상속 1.5 | 작은 상태 label, 표 보조 정보 |
| text-meta         | 13px |         상속 1.5 | 설명, hint, 부가 정보         |
| text-body         | 14px |         상속 1.5 | 본문, 입력, 버튼              |
| text-subtitle     | 15px |         상속 1.5 | 카드와 section 제목           |
| text-label        | 16px |         상속 1.5 | 강조 label                    |
| text-dialog-title | 20px |         상속 1.5 | 전역 크기 token               |
| text-page-title   | 24px |         상속 1.5 | 기본 페이지 제목              |
| text-metric       | 40px |         상속 1.5 | 기본 지표 값                  |

공통 component가 정한 더 구체적인 규격은 일반 token보다 우선합니다.

| 역할               |    크기 | weight | line-height와 자간                    |
| ------------------ | ------: | -----: | ------------------------------------- |
| 로그인 제목        |    20px |    500 | 1.0, 보통 자간                        |
| 로그인 설명        |    13px |    400 | 1.6                                   |
| 로그인 field label |    12px |    700 | 1.35                                  |
| 로그인 Input       |    14px |    400 | 1.35                                  |
| Chip label         |  12.5px |    600 | 상속, 보통 자간                       |
| SegmentedControl   |  13.5px |    600 | normal, -0.02em; 선택 값은 700        |
| Modal 제목         |    17px |    700 | 1.4, -0.03em                          |
| Modal 설명         |  12.5px |    400 | 1.6                                   |
| Modal 본문         |    13px |    400 | 1.6                                   |
| Toast              |    14px |    600 | 1.4, -0.01em                          |
| 공통 Button        |    14px |    500 | 1.5                                   |
| Select             |  13.5px |    600 | 1.5, -0.01em                          |
| DataTable header   |    13px |    500 | 1.5                                   |
| Sidebar menu       |    14px |    500 | 선택 중은 600, 비활성은 기본 text     |
| Sidebar section    |    12px |    600 | text-subtle, 0.08em tracking          |
| 페이지 제목        |    24px |    700 | 1.5, 화면에 따라 -0.02em 또는 -0.03em |
| 지표 값            | 30–40px |    600 | 1.1, Inter와 tabular-nums 사용        |

font token은 크기만 정하고 weight와 자간은 역할에 따라 지정합니다. 별도 안내가 없는 text-meta는 13px입니다. 원본의 Chip label은 12.5px, SegmentedControl label은 13.5px입니다.

안내·가이드 문구는 기본 weight인 400을 사용하고, 주변 본문보다 grayscale 위계를 한 단계 낮춥니다. 기본 본문 `text`보다 한 단계 낮은 안내는 `text-muted`를, 이미 보조 설명인 문장보다 더 낮춰야 할 때는 `text-subtle`을 사용합니다.

## 간격·크기·모서리

기본 간격은 4px 배수의 Tailwind scale을 사용합니다. USP Admin shell에서 쓰는 대표 간격은 4, 6, 8, 12, 16, 20, 24, 32px입니다.

| 규격                  |            값 | 주요 사용                          |
| --------------------- | ------------: | ---------------------------------- |
| radius-sm             |           6px | 작은 badge와 option                |
| radius-md             |           8px | Button, Input, menu, Modal control |
| radius-lg             |          10px | 작은 표면                          |
| radius-xl             |          14px | 카드, panel, Toast                 |
| radius-2xl            |          18px | Modal                              |
| radius-pill           |        9999px | chip, capsule                      |
| 기본 Button 최소 높이 |          40px | 공통 action                        |
| 기본 Input 최소 높이  |          40px | 일반 form                          |
| 로그인 field 높이     |          44px | 이메일과 비밀번호                  |
| 로그인 카드 폭        |         380px | 화면 중앙 로그인                   |
| Sidebar 폭            | 232px / 208px | 넓은 화면 / 1360px 이하            |
| Toast 아래 여백       |          86px | viewport 하단 기준                 |

특정 component의 padding과 치수는 아래 Component 규격 표를 기준으로 합니다. 임의값은 그 규격을 충족하기 위한 크기가 spacing scale에 없을 때만 사용합니다.

## 색상 대비와 상태

- 주요 작업 버튼은 primary 배경과 on-primary 글자를 사용합니다.
- 활성 native button, button 역할 요소, tab·segment와 button 타입 input은 pointer cursor를 사용합니다. 비활성 상태는 cursor-not-allowed와 낮은 opacity를 적용하고, 상태가 전달되어야 할 때 aria-disabled 또는 native disabled도 함께 사용합니다.
- 오류는 색상만으로 표현하지 않고 label, 오류 문장, aria-invalid를 연결합니다.
- loading skeleton은 비동기 응답을 기다리는 데이터 바인딩 값에만 적용합니다. 고정 문구와 화면 구조는 모두 그대로 표시합니다. 여기에는 제목, label, 고정 설명, filter·segment, 탭, section heading, table caption·column header, 상태·작업 버튼의 이름, 고정된 예시/선택값, 단위와 문장 안의 조사·접미사가 포함됩니다. DataTable loading fallback도 실제 caption·column header·고정 action control을 유지하고 행의 데이터 값만 skeleton으로 바꿉니다. 고정 문구와 동적 값이 한 문장에 있으면 문장을 나누어 실제 값 부분만 대체합니다. 서버 데이터가 없는 빈 신규 form, 고정 설정·상수, 이미 알 수 있는 route parameter에는 skeleton을 쓰지 않습니다.
- Skeleton은 USP Web과 같은 흐르는 linear-gradient shimmer를 사용하며 pulse나 단색 깜박임으로 대체하지 않습니다. 기본색은 `#e1e4e8`, highlight는 흰색이고, 폭 48%의 gradient layer가 `translateX(-55%)`에서 `translateX(220%)`까지 1.2초 linear 무한 반복합니다. 첫 frame에도 gradient가 보이도록 시작점을 skeleton 안쪽과 겹치게 둡니다. 시작 위치는 Tailwind `translate-x`가 아니라 keyframe의 `transform`으로 지정합니다. Skeleton 자체는 `aria-hidden`이며 부모에서 `aria-busy`와 status 문장을 제공합니다.
- reduced-motion 환경에서는 Skeleton shimmer와 overlay 전환 애니메이션을 중단하거나 거의 즉시 끝냅니다.

## 실제 공통 컴포넌트

다음 표는 [src/component/ui](src/component/ui)의 현재 source를 기준으로 합니다. 단일 native select는 공통 `Select`를 사용합니다. ContextualMenu처럼 표에 없는 이름은 현재 공통 component가 아닙니다.

### 기본 UI와 로딩

| Component            | Source                                                                                                             | Props와 동작                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button               | [Button.tsx](src/component/ui/Button.tsx), [design-system-contract.ts](src/component/ui/design-system-contract.ts) | native button props, variant primary/secondary/danger. 기본 type은 button이며 focus와 disabled를 지원합니다.                                         |
| Input                | [Input.tsx](src/component/ui/Input.tsx)                                                                            | native input props, 최소 높이 40px. invalid, disabled, placeholder, focus 상태를 표시합니다.                                                         |
| Select               | [Select.tsx](src/component/ui/Select.tsx)                                                                          | native select props, 40px 높이, white surface, strong border, 13.5px semibold label과 공통 chevron을 제공합니다.                                     |
| Badge                | [Badge.tsx](src/component/ui/Badge.tsx), [EmbeddedBadge.tsx](src/component/ui/embedded/EmbeddedBadge.tsx)          | tone neutral/primary/success/warning/danger/quiet. 기본 tone은 neutral이며 USP Admin의 작성 중·게시 중·검수 요청·게시 중단·비활성 표현을 포함합니다. |
| Skeleton             | [Skeleton.tsx](src/component/ui/Skeleton.tsx)                                                                      | shape line/block/circle/bar, className, animationDelay(ms). 너비와 높이는 className으로 지정하며 Skeleton은 장식 요소로 aria-hidden입니다.           |
| DesignSystemProvider | [DesignSystemProvider.tsx](src/component/ui/DesignSystemProvider.tsx)                                              | embedded, workspace, external 선택을 제공합니다. provider component map은 Button, Input, Badge, Skeleton 네 항목입니다.                              |

`Badge`는 23px 높이, pill radius, 12px semibold 글자, 좌우 9px padding을 사용합니다. USP Admin 화면에서 쓰던 데이터 상태를 아래의 공통 tone으로 표현합니다.

| tone    | 배경·테두리·글자                                              | 사용 예시                          |
| ------- | ------------------------------------------------------------- | ---------------------------------- |
| neutral | surface `#ffffff`, border `#e8eaee`, text-secondary `#3d3d3d` | Demo data, 작성 중, PENDING        |
| primary | primary-soft `#eef2fb`, 테두리 없음, primary-strong `#0e3191` | 게시 중, 활성                      |
| success | surface-muted `#eef2fb`, 테두리 없음, positive `#16794b`      | 결제 완료 등 성공 정보             |
| warning | warning-surface `#fdf3e7`, 테두리 없음, warning `#8a5a12`     | 검수 요청, 초대 대기               |
| danger  | negative-surface `#fbeaea`, 테두리 없음, negative `#b3262b`   | 게시 중단, 실패, 반려              |
| quiet   | surface `#ffffff`, border `#e8eaee`, text-subtle `#a8a8a8`    | 비활성처럼 낮은 강조가 필요한 상태 |

결제 목록의 PAID는 positive 상태도 USP Admin의 표준 blue `primary` tone을 사용하고, FAILED는 red `danger` tone을 사용합니다. PENDING은 neutral 기본형을 그대로 씁니다. `success`는 결제 이외의 일반 완료 피드백에 사용합니다. 사용자 전달 샘플 데이터에는 `Demo data`처럼 데이터 성격을 알리는 neutral label을 붙입니다.

Skeleton 모양은 USP Web의 흐르는 gradient를 따라 base `#e1e4e8`와 흰색 highlight를 사용하고, 폭 48%인 layer를 1.2초 linear 주기로 이동합니다. 첫 frame부터 움직임이 보여야 하며 pulse나 단색 깜박임은 사용하지 않습니다. Skeleton은 비동기 응답을 기다리는 데이터 바인딩 값에만 두고, 제목·label·고정 설명·filter·segment·section heading·caption·column header·작업 control 같은 고정 UI와 고정 예시값은 계속 보여줍니다. 표에서는 실제 column header와 caption 및 고정 작업 label을 유지하고 행의 데이터 cell만 skeleton으로 둡니다. 한 문장 안에 고정 문구와 데이터 값이 섞이면 문구와 단위는 유지하고 실제 바인딩 값만 skeleton 처리합니다. 정적 form 값, 고정 설정/상수, 이미 아는 route parameter에는 skeleton을 쓰지 않습니다. 텍스트 skeleton은 실제 바인딩 문자열의 평균 길이와 줄 수를 기준으로 너비·높이를 정하고, 카드·표의 skeleton은 로딩 완료 후의 배치와 행·열 개수를 그대로 반영합니다. 실제 높이와 너비는 className으로 지정합니다. 불러오는 상태를 표현하는 화면은 데이터 값 자리에 skeleton을 렌더링하고 부모에 aria-busy를 설정합니다.

데이터 바인딩 전후에는 레이아웃 시프트(Layout Shift)가 없어야 합니다. Skeleton과 최종 값은 같은 레이아웃 자리를 사용하고, 바인딩 요소와 주변 콘텐츠의 위치·너비·높이·줄 수·정렬·간격·행 밀도를 유지합니다. Skeleton을 넣기 위해 wrapper, margin, padding, grid/flex 구조를 추가하거나 로딩 완료 때 제거하지 않습니다. 컬렉션 길이를 아직 모르는 경우에는 페이지 크기나 고정된 결과 영역 높이를 예약해 첫 로딩과 결과 표시 사이에도 주변 content가 움직이지 않게 합니다. UI 검수에서 loading과 loaded 상태의 요소 및 주변 영역을 비교해 위치와 크기가 바뀌면 수정하며, 데이터 바인딩 전환으로 인한 CLS는 0이어야 합니다.

페이지를 새로 만들 때는 그 화면의 구조에 맞춘 전용 `PageSkeleton` component도 만듭니다. Route module이나 데이터가 Suspense 방식으로 대기하면 페이지 element만 `<Suspense fallback={<PageSkeleton />}>`로 감싸고 공통 Shell은 유지합니다. 일반 `isLoading` 상태는 Suspense를 발생시키지 않으므로 해당 화면의 로딩 상태를 여전히 분기해야 하며, 같은 `PageSkeleton`을 재사용합니다. Suspense data source를 쓰는 경우에만 중복 loading 분기를 생략합니다. Empty·error와 action pending은 별도 상태입니다. 구현 위치와 경계 규칙은 [Frontend 아키텍처의 페이지별 loading fallback](.agents/references/frontend-architecture.md#페이지별-loading-fallback)을 따릅니다.

이 템플릿 demo는 [useDemoLoading.ts](src/page/demo/shared/useDemoLoading.ts)의 공통 지연값 300ms를 사용합니다. 공통 컴포넌트 예시의 다시 보기, 데이터 목록·상세·리포트, 결제 검색·페이지 변경, 스토리 편집 첫 진입에서 데이터 값의 skeleton을 확인할 수 있습니다. 서버 데이터가 없는 신규 등록 form은 고정 UI를 처음부터 그대로 렌더링합니다. 이 지연은 skeleton 예시 전용이며 API 호출이나 서비스의 실제 대기 시간 계약을 뜻하지 않습니다.

### 입력과 선택

| Component           | Source                                                              | Props와 동작                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| FormField           | [FormField.tsx](src/component/ui/FormField.tsx)                     | label, htmlFor, hint, error, required를 구성합니다. 입력 id와 오류/hint 연결은 소비 화면이 제공합니다.                                             |
| Select              | [Select.tsx](src/component/ui/Select.tsx)                           | 간단한 단일 선택에 사용하는 native select wrapper입니다. label과 FormField 안에 배치하고 화면마다 별도 화살표·색상·font style을 만들지 않습니다.   |
| Combobox            | [Combobox.tsx](src/component/ui/Combobox.tsx)                       | 단일 자동완성 선택. optionList, value, inputValue, onInputChange, onChange를 받으며 방향키, Enter, Escape, 비활성 option, 빈 결과를 지원합니다.    |
| ChipInput           | [ChipInput.tsx](src/component/ui/ChipInput.tsx)                     | valueList 칩과 소비자가 제공한 input을 합성합니다. 선택적으로 suggestionList를 받아 고정 위치 추천 패널을 함께 표시합니다.                         |
| ChipInputOptionList | [ChipInputOptionList.tsx](src/component/ui/ChipInputOptionList.tsx) | 입력 필드 아래에 고정되는 listbox입니다. 화면 경계에 맞춰 위·아래를 정하고, scroll·resize에 위치를 맞춥니다.                                       |
| ChipInputOption     | [ChipInputOption.tsx](src/component/ui/ChipInputOption.tsx)         | 검색 추천 또는 새 값 추가 항목을 표시하는 listbox option button입니다. 기본·muted tone과 detail을 지원합니다.                                      |
| ChipSelect          | [ChipSelect.tsx](src/component/ui/ChipSelect.tsx)                   | ChipInput 위에 다중 선택 목록을 제공합니다. 옵션 열기, 방향키 이동, Enter/Space 선택, Escape 닫기, 바깥 pointer 닫기, 선택 chip 제거를 지원합니다. |
| RemovableChip       | [RemovableChip.tsx](src/component/ui/RemovableChip.tsx)             | label, removeLabel, 선택적 title, disabled, onRemove로 개별 chip 삭제를 처리합니다.                                                                |
| SegmentedControl    | [SegmentedControl.tsx](src/component/ui/SegmentedControl.tsx)       | optionList, value, onChange를 받는 단일 선택 button group. role=group와 aria-pressed를 사용하며 option별 disabled와 sm/md 크기를 지원합니다.       |
| Dropzone            | [Dropzone.tsx](src/component/ui/Dropzone.tsx)                       | accept, multiple, disabled, hint, onFileChange(fileList). 선택과 drag/drop만 처리하며 실제 업로드는 소비 화면 책임입니다.                          |

ChipInput은 최소 높이 40px, gap 6px, 경계 #d3d7de, 가로 padding 12px, 세로 padding 8px입니다. 내부 입력은 26px 높이, 최소 너비 120px, 13.5px 글자입니다. RemovableChip은 26px pill, 12.5px semibold, navy #0e3191 배경이며 닫기 버튼은 18px 원형 영역입니다. SegmentedControl은 8px radius, 1px strong border, segment 사이 1px 구분선을 사용합니다. md는 38px 높이·13.5px 글자, sm은 30px 높이·12.5px 글자입니다. 버튼은 pointer cursor를 사용하고 비활성 버튼은 not-allowed로 바뀝니다. 미선택 버튼은 USP Admin의 cloud #f7f8fa 배경과 ink #1a1a1a 글자 hover 상태를 사용하고, 선택 버튼은 primary #024ad8 배경·흰 글자·굵기 700을 유지합니다. 720px 이하에서는 3개 항목을 한 줄 grid로 배치하고 원본처럼 바깥 경계와 행 구분선을 유지합니다.

### 상태와 데이터 표시

| Component          | Source                                                            | Props와 동작                                                                                                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PendingButton      | [PendingButton.tsx](src/component/ui/PendingButton.tsx)           | Button에 pending spinner, disabled, aria-busy를 적용합니다.                                                                                                                                                                                               |
| AsyncState         | [AsyncState.tsx](src/component/ui/AsyncState.tsx)                 | loading, empty, error, success를 분기합니다. loading은 busy/status, error는 alert 의미를 제공합니다.                                                                                                                                                      |
| DataTable          | [DataTable.tsx](src/component/ui/DataTable.tsx)                   | 선택적 caption 또는 ariaLabel, rowList, columnList, rowKey를 받는 semantic table. 전체/개별 선택, pending, empty 상태를 지원합니다. Header 배경은 투명하고 text-muted·font-medium을 사용합니다. Visible caption은 px-4로 data column과 좌측선을 맞춥니다. |
| DetailList         | [DetailList.tsx](src/component/ui/DetailList.tsx)                 | label/value 쌍을 definition list 형태로 표시합니다.                                                                                                                                                                                                       |
| StatCard           | [StatCard.tsx](src/component/ui/StatCard.tsx)                     | label, ReactNode value, 선택 detail과 교체 가능한 icon slot을 지표 카드로 표시합니다. 기본 값은 40px이며 icon 조합은 30px로 표시하고 icon은 공통 원형 surface에 놓습니다.                                                                                 |
| HorizontalBar      | [HorizontalBar.tsx](src/component/ui/HorizontalBar.tsx)           | label, value, maxValue, valueText, tone, 크기, trackWidth로 독립 수평 막대 하나를 표시합니다. progressbar 접근성 값을 제공하고 value를 0~maxValue로 제한합니다.                                                                                           |
| VerticalBar        | [VerticalBar.tsx](src/component/ui/VerticalBar.tsx)               | label, value, maxValue, valueText, tone, 크기와 너비·높이로 독립 수직 막대 하나를 표시합니다. progressbar 접근성 값을 제공하고 value를 0~maxValue로 제한합니다.                                                                                           |
| HorizontalBarChart | [HorizontalBarChart.tsx](src/component/ui/HorizontalBarChart.tsx) | title과 itemList를 연결해 제목·행 레이블·수평 막대·값으로 구성된 카드형 차트를 표시합니다. valueFormatter, headerMeta, headerAction, maxValue를 선택할 수 있습니다.                                                                                       |
| VerticalBarChart   | [VerticalBarChart.tsx](src/component/ui/VerticalBarChart.tsx)     | title과 itemList를 연결해 제목·수직 막대·범례 레이블·값 요약이 포함된 카드형 차트를 표시합니다. valueFormatter, headerMeta, footer, maxValue를 선택할 수 있습니다.                                                                                        |

DataTable 칼럼은 `TableColumn.widthRatio`에 양수를 지정해 비율을 고정합니다. 비율은 전체 합에 맞춰 정규화되며, 비율을 지정하지 않은 칼럼은 1로 계산합니다. 어느 칼럼에든 비율을 지정하면 `table-layout: fixed`를 사용해 행 내용이나 필터 결과가 바뀌어도 칼럼 경계가 유지됩니다. 선택 checkbox 칼럼은 `selection.widthRatio`로 조절하며 기본 비율은 0.5입니다. 비율을 지정하지 않으면 기존 자동 배치를 유지합니다.

두 차트 템플릿은 `BarChartItem` 목록을 받습니다. 각 항목의 `id`, `label`, `value`가 필수이며, `displayValue`는 항목별 표시 문구를 덮어쓸 때 사용합니다. `valueFormatter(value, item)`을 전달하면 모든 항목의 값과 기본 접근성 문구를 한 번에 포맷할 수 있습니다. `ariaLabel`은 progressbar의 접근성 이름, `tone`은 막대 색상 선택값입니다. 기본 최대값은 100입니다. 비율이 아닌 원시 수치를 그릴 때는 `maxValue`를 함께 전달합니다. `HorizontalBar`와 `VerticalBar`를 직접 써서 표나 다른 레이아웃 안에 막대를 하나씩 배치할 수도 있습니다.

```tsx
const departmentItemList = [
	{ id: "marketing", label: "마케팅", value: 100, displayValue: "1/1 · 100%" },
	{ id: "planning", label: "기획", value: 66.67, displayValue: "2/3 · 66.67%" },
];

<HorizontalBarChart title="부서별 계정 활성률" itemList={departmentItemList} />;

const weeklyReturnItemList = [
	{ id: "w0", label: "W0", value: 100 },
	{ id: "w1", label: "W1", value: 33.33, tone: "secondary" },
	{ id: "w2", label: "W2", value: 0, tone: "muted" },
];

<VerticalBarChart
	title="주차별 재방문율"
	headerMeta="W0 코호트"
	valueFormatter={(value) => `${value}%`}
	itemList={weeklyReturnItemList}
/>;
```

수평 막대는 `sm` 8px 또는 `md` 10px 높이의 둥근 track 위에 값을 채웁니다. 수직 막대는 기본 `md` 32×144px이며 `sm` 24×96px, `lg` 40×192px 크기를 선택할 수 있습니다. 수평 차트는 12px 카드 radius, 56px 이상 헤더, 20px 본문 inset과 20px 행 간격을 사용합니다. 행은 기본 `120px / 유동 track / 100px` 열이며, 720px 이하에서는 `56px / 유동 track / 값 너비`와 8px 간격으로 줄이고 값은 한 줄을 유지합니다. 수직 차트는 같은 카드·헤더 규격에 184px 이상 plot 영역과 12px footer 간격을 사용합니다. `tone`은 `primary`, `secondary`, `positive`, `negative`, `muted` 중 선택하며 기존 theme token과 primary 색의 70% 농도를 사용합니다. 차트 템플릿은 카드와 행·막대·요약 배치를 소유하고, 데이터 조회·정렬·숫자 계산·클릭 동작은 소비 화면이 전달합니다.

### Breadcrumb과 section navigation

| Component          | Source                                                                                  | Props와 동작                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Breadcrumb         | [breadcrumb/Breadcrumb.tsx](src/component/ui/breadcrumb/Breadcrumb.tsx)                 | crumb list를 표시하고 마지막 crumb를 현재 페이지로 표시합니다. renderLink로 router Link를 주입할 수 있습니다.                              |
| BreadcrumbProvider | [breadcrumb/BreadcrumbProvider.tsx](src/component/ui/breadcrumb/BreadcrumbProvider.tsx) | Breadcrumb state를 하위 BreadcrumbSlot에 제공합니다.                                                                                       |
| BreadcrumbSlot     | [breadcrumb/BreadcrumbSlot.tsx](src/component/ui/breadcrumb/BreadcrumbSlot.tsx)         | 상위 layout이 현재 route의 Breadcrumb을 렌더링하는 자리입니다.                                                                             |
| SectionRail        | [SectionRail.tsx](src/component/ui/SectionRail.tsx)                                     | 선택적 id, itemList, activeId, onSelect로 페이지 내부 section을 이동합니다. 소비 화면이 fixed/sticky 위치, 너비, 스크롤 여백을 배치합니다. |

편집 화면 예시는 [DemoEditorPage.tsx](src/page/demo/editor/DemoEditorPage.tsx)의 /editor/H084입니다. 상단에는 Breadcrumb과 페이지 header를 고정하고, 너비 196px인 SectionRail을 header 아래 desktop에서 고정합니다. section 본문은 페이지 scroll을 사용하며 모바일에서는 header와 rail이 sticky 흐름으로 전환됩니다. 태그는 FormField + ChipInput + ChipInputOptionList로 기존 추천을 고르거나 새 값을 추가하고, 한글 IME 조합 중 Enter는 태그를 확정하지 않습니다. 인물 카테고리는 여러 개를 선택하는 ChipSelect, 큐브 위치는 FormField + Input을 조합합니다. 추천 데이터와 저장은 브라우저 안에서만 처리합니다.

### Modal과 Toast

[OverlayProvider](src/component/overlay/OverlayProvider.tsx)는 theme root 내부에 portal host를 한 번 만듭니다. [useOverlay](src/component/overlay/useOverlay.ts)는 openModal과 showToast를 제공합니다. OverlayProvider는 data-theme-root 아래에 둡니다.

| API   | 규격                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modal | { title, size?, layout?, description?, descriptionVariant?, content, footer?, isPending?, closeLabel? }. size는 default 460px 또는 wide 520px입니다. layout은 default 또는 segmented입니다. descriptionVariant="title"은 제목 역할을 하는 description을 15px semibold로 표시합니다. segmented는 520px 너비와 구분선이 있는 header/body/footer를 사용합니다. 반환 controller의 close()와 update(partialOptions)를 사용합니다. |
| Toast | { message, tone?, durationMs? }. tone은 info/success/error, 기본 노출 시간은 4000ms, durationMs=0은 수동 dismiss까지 유지합니다. 반환 controller의 dismiss()로 닫습니다.                                                                                                                                                                                                                                                     |

Modal은 native dialog top layer를 사용합니다. 최대 높이는 viewport 높이 - 48px, radius 18px, 기본 inset 24px, strong navy scrim 55%와 6px blur, navy tint shadow입니다. default layout은 460px surface 안에 24px inset을 두고 header 아래에 description을 표시하며 footer를 본문에서 분리하지 않습니다. segmented layout은 520px 너비와 구분선이 있는 header/body/footer를 사용합니다. segmented header는 32px 24px, body는 32px 24px, footer는 32px 20px padding을 씁니다. 제목은 17px bold, 기본 description은 13px, title variant description은 15px semibold, 본문은 13px, 기본 control은 14px, footer button은 40px입니다. Escape와 backdrop으로 닫고 opener focus를 복귀합니다. pending 중에는 닫을 수 없습니다.

Toast는 화면 하단에서 86px 위의 중앙에 고정되며 z-index 11000, 최대 너비 viewport - 32px, 14px radius, 1px border, 12px 24px padding, 흰 surface와 navy tint shadow를 사용합니다. 기본 한 줄 글자는 14px semibold이며 여러 줄 메시지는 17px로 왼쪽 정렬합니다. role=status와 polite live region으로 알립니다. tone은 오류 메시지의 보조 문구에만 쓰고 외형 색을 바꾸지 않습니다. Toast 자체에는 닫기 버튼이 없습니다.

### Layout과 인증 경계

| Component          | Source                                                                                               | 역할                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell              | [layout/Shell.tsx](src/layout/Shell.tsx)                                                             | auth, permission, brand, navigation과 page content를 조립하고 theme root, skip link, main landmark와 공통 본문 프레임을 제공합니다.           |
| Sidebar            | [layout/Sidebar.tsx](src/layout/Sidebar.tsx)                                                         | brand, 메뉴, 소비자가 전달한 사용자 이름, 로그아웃 action을 표시합니다. 프로필은 왼쪽, 로그아웃은 오른쪽으로 정렬합니다.                      |
| Navigation         | [layout/Navigation.tsx](src/layout/Navigation.tsx)                                                   | capability 조건을 통과한 메뉴를 렌더링합니다. `NavigationItem.section`이 있으면 그룹 제목으로 묶고, href·router link·onNavigate를 연결합니다. |
| AuthBoundary       | [component/authentication/AuthBoundary.tsx](src/component/authentication/AuthBoundary.tsx)           | AuthAdapter 상태에 따라 loading, anonymous, error, authenticated 화면 경계를 만듭니다. 실제 로그인·세션 발급은 하지 않습니다.                 |
| CapabilityBoundary | [component/authorization/CapabilityBoundary.tsx](src/component/authorization/CapabilityBoundary.tsx) | 소비 프로젝트 PermissionAdapter의 capability 판정을 화면에 반영합니다. 서버 권한 검사를 대신하지 않습니다.                                    |

비활성 Navigation label은 기본 `text-text` grayscale을 사용하고, hover는 `bg-canvas`와 `text-text`를 사용합니다. SectionRail의 비활성 항목도 Sidebar 메뉴와 같은 전체 행 hover 상태를 사용합니다.

`Shell`은 Breadcrumb와 route page를 하나의 왼쪽 정렬 본문 프레임에 배치합니다. 프레임은 사용 가능한 너비를 채우고 최대 너비는 1440px(`max-w-360`)로 고정하며, 좁은 화면에서는 Shell의 좌우 여백 안에서 전체 너비를 사용합니다. 모든 페이지 루트는 이 프레임을 상속하므로 별도의 최대 너비나 바깥쪽 padding을 추가하지 않습니다. 읽기 편의를 위한 제한은 폼·카드처럼 본문 안의 개별 영역에만 둡니다. 고정형 편집 header도 같은 최대 너비에 맞춥니다.

Sidebar의 logo와 brand title은 하나의 keyboard-accessible home link입니다. `<Shell homePath={...}>`에 app-local path를 전달하며 기본값은 `/`입니다. Router 내부에서는 Link가 basename을 적용하고, router 바깥에서는 `href`와 선택 `onNavigate`를 사용합니다. Starter Shell은 `/`에 기본 대시보드를 표시합니다. Development Demo는 `/demo` 안에서 `routePath.root`를 전달하고 Demo의 root route는 overview로 redirect합니다. 링크에는 `cursor-pointer`와 visible keyboard focus를 표시합니다.

### Sidebar Navigation 메뉴 추가

`Navigation`은 제품 메뉴를 내부에 보관하지 않고 `Shell.navigationList`로 전달된 `NavigationItem[]`를 렌더링합니다. `path`와 `label`은 필수이며 `section`, `icon`, `badge`, `capability`는 선택 항목입니다. 소비 프로젝트는 자사 router에 등록된 app-local path와 메뉴 항목을 함께 관리합니다. `layout/Navigation.tsx`에 제품별 메뉴를 직접 추가하지 않습니다.

배열 순서가 섹션과 메뉴의 표시 순서를 결정합니다. 같은 `section` 값은 한 그룹으로 모이며, 첫 등장 순서대로 표시합니다. `section`이 없으면 섹션 제목 없이 기본 그룹에 표시합니다. 아이콘은 장식 요소로 취급하고, `badge`는 항목의 보조 정보를 표시할 때만 사용합니다.

`capability`가 없는 항목은 메뉴에 표시합니다. capability를 지정한 항목은 consumer의 `PermissionAdapter.capabilityList`에 그 값이 있고 `allows()`도 `true`를 반환할 때만 표시합니다. 메뉴 숨김은 직접 URL 접근을 보호하지 않으므로, 필요한 route element에도 permission boundary를 적용하고 실제 backend authorization은 소비 제품에서 구현합니다.

새 Demo 메뉴가 기존 화면으로 연결되면 `src/app/demo/demo-adapter.ts`의 `demoNavigationList`에 canonical `routePath`를 사용해 추가합니다. 새 Demo 화면이면 `routePath`, `RouteElementMap`, 명시적 `Route`, `routeHandle`, `DemoApp` element, `demoNavigationList`를 함께 연결합니다. 소비 앱은 자사 router와 `Shell.navigationList`를 갱신하며 template Demo route를 변경하지 않습니다. 메뉴용 Skill인 `dix-admin-menu`를 따릅니다.

Desktop과 mobile 메뉴는 같은 component를 사용합니다. 섹션 제목은 12px semibold와 `text-text-subtle`, 메뉴 label은 14px medium, 현재 항목은 semibold와 `primary-soft` 배경·`primary-strong` 글자를 사용합니다. Hover와 focus 표현을 유지하고 실제 링크의 `href`, `aria-current="page"`, query를 포함한 `activePath`를 확인합니다.

로그인 화면의 소비 프로젝트용 auth boundary와 local preview UI를 구분합니다. 공통 `LoginPage`는 기본 Shell과 `/demo/login`에서 재사용하며, 380px 카드, 44px field, 20px 제목, 공통 Pretendard stack과 focus 동작을 Tailwind utility로 재현합니다. Starter 로그인과 Demo 로그인은 local UI 상태만 바꾸며 인증 서버에 값을 보내지 않습니다.

Sidebar는 넓은 화면에서 232px, 1360px 이하에서 208px입니다. 720px 이하에서는 상단 탐색으로 바뀝니다. desktop 좌측 Sidebar는 viewport에 고정되고, main content는 자체 문서 흐름으로 스크롤됩니다. 개발 demo logo는 소비 브랜드를 대체하지 않으며 Brand.logo와 Brand.title을 바꿔 사용할 수 있습니다. `Brand.logo`에 `<img>`를 전달하면 Sidebar image source를 favicon에도 자동 연결하고, inline SVG는 현재 theme의 색을 반영한 SVG favicon으로 연결합니다. SVG favicon은 `sizes="any"`로 브라우저 크기에 맞게 표시하고, raster image는 원본 source와 intrinsic size를 사용합니다.

## 화면 예시

로그인 뒤 Sidebar의 공통 컴포넌트 링크는 `/demo/component`를 엽니다. 실제 UI source에 있는 Button, Badge, Input, Select, Skeleton, StatCard, FormField, Combobox, ChipInput, ChipSelect, SegmentedControl, RemovableChip, Dropzone, PendingButton, AsyncState, DataTable, DetailList, HorizontalBar, VerticalBar, HorizontalBarChart, VerticalBarChart, Modal, Toast를 조작해 봅니다. 그래프 예시에는 단일 막대 조각과 itemList만 연결하는 완성형 차트를 모두 둡니다. Badge variation에는 USP Admin에서 쓰는 기본 중립·게시/활성·검수/초대·게시 중단·비활성 표현과 결제 성공 상태를 예시로 둡니다. ContextualMenu는 별도 공통 component로 제공하지 않습니다.

[DemoDashboardPage.tsx](src/page/demo/overview/DemoDashboardPage.tsx)의 /overview는 진입과 기간 변경 시 카드, 표, 막대의 데이터 값에 300ms skeleton을 보여줍니다. 유저스토리 카드는 게시 중·작성 중·검수 요청 라벨을 유지하고 숫자만 skeleton으로 바꿉니다. [DemoListPage.tsx](src/page/demo/item/DemoListPage.tsx)와 [DemoDetailPage.tsx](src/page/demo/item/detail/DemoDetailPage.tsx)는 진입 시 데이터 목록·상세 값에 skeleton을 보여줍니다. 서버 데이터가 없는 [DemoFormPage.tsx](src/page/demo/item/new/DemoFormPage.tsx)와 담당자 계정 발급 form은 고정된 입력 label과 빈 입력을 바로 표시합니다. [DemoPaymentPage.tsx](src/page/demo/payment/DemoPaymentPage.tsx)의 /green-pasture/payment는 최초 요약·표 로딩과 검색·페이지 전환 중 데이터 값에 300ms skeleton을 보여줍니다. 값과 필터 결과는 브라우저 안의 샘플입니다.

결제 페이지는 공통 StatCard, FormField, Input, Select, PendingButton, AsyncState, Skeleton, DataTable, Badge, DetailList, Modal을 조합한 완성 예시입니다. PAID는 primary blue badge, FAILED는 danger red badge, PENDING은 USP Admin의 흰 배경·hairline 테두리·charcoal 글자 조합을 사용합니다. metric icon은 StatCard의 icon prop으로 교체합니다. 샘플 주문은 결제 처리, 환불, 상품 수정 API를 호출하지 않습니다. 페이지 경로는 [src/route/route-paths.ts](src/route/route-paths.ts)의 /:appId/payment을 확인합니다.

### USP Admin 화면 목록

`/demo`를 열면 Demo Sidebar의 섹션 메뉴에서 각 화면을 확인할 수 있습니다. 화면 구조와 대표 조작은 `usp-web` Admin에 등록된 화면을 바탕으로 옮겼고, 값·필터·판정 결과는 브라우저 안에서만 동작하는 예시입니다. 서버 인증, 권한 검사, 분석 조회, 파일 업로드와 저장 API에는 연결되지 않습니다. 소비 프로젝트에서 데모 확인을 마치면 `npm run remove:demo`로 화면 source와 전용 통합 테스트를 한 번에 제거할 수 있습니다.

| 화면                    | Demo 경로                           | 화면 구성                                                                                |
| ----------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| 대시보드                | `/demo/overview`                    | 기간 segment, 운영 지표, 순위 표, 부서별 수평 막대와 주차별 수직 막대                    |
| 유저스토리 리포트       | `/demo/report/stories`              | 6종 리포트 공통 프레임과 유저스토리 순위 표                                              |
| 참여 항목 응답률        | `/demo/report/engagement`           | A/B·Poll 질문, 화면 연결, 도달·응답·응답률 표                                            |
| 화면별 도달률           | `/demo/report/screens`              | 화면 단계별 도달률과 완독률 표                                                           |
| 부서별 가입 계정 활성률 | `/demo/report/departments`          | 활성 지표, 부서별 표와 재사용 수평 막대 차트                                             |
| 활동 사용자             | `/demo/report/users`                | 부서·참여 횟수·최근 활동 순위 표                                                         |
| 인기 댓글               | `/demo/report/comments`             | 스토리별 댓글, 공감과 답글 수 표                                                         |
| 스토리별 리포트         | `/demo/report/stories/H045`         | 스토리 지표, 화면별 도달 차트, 참여 항목 요약                                            |
| 유저스토리 관리         | `/demo/stories`                     | 뷰·상태·담당자 필터, 업로드 action과 header 없이 표시하는 목록 table                     |
| 신규 등록               | `/demo/stories/new`                 | 콘텐츠 패키지·개요·참여 항목·변경 이력 rail과 빈 등록 폼                                 |
| 스토리 편집             | `/demo/stories/H084`                | 고정 breadcrumb/header와 section rail, 스크롤 본문, 태그·뷰·참여 입력                    |
| 모더레이션              | `/demo/moderation`                  | 신고 사유·댓글·상태 표, 검토 modal과 유지·숨김 조작                                      |
| 계정 목록               | `/demo/accounts`                    | 회사·권한·상태 계정 표와 필터                                                            |
| 담당자 계정 발급        | `/demo/accounts/new`                | 회사·이메일·이름·직책 초대 폼과 완료 상태                                                |
| 접근 거부               | `/demo/accounts/access-denied`      | 제한된 권한 상태 안내                                                                    |
| 신규 검수 요청          | `/demo/review/H084?mode=submission` | 신규 제출 패키지, 요약, 확인 항목, 승인·반려 판정                                        |
| 업데이트 검수           | `/demo/review/H084?mode=version`    | 게시본과 제출본 비교, 변경 메모, 확인 항목, 승인·반려 판정                               |
| 로그인                  | `/demo/login`                       | 초기에는 인증된 예시 세션으로 대시보드에 진입하며, 로그아웃을 눌렀을 때 로그인 UI를 표시 |
| 페이지 없음             | Demo 내부 미등록 경로               | 404 안내와 대시보드 이동                                                                 |

리포트 종류는 [DemoReportPage.tsx](src/page/demo/report/DemoReportPage.tsx) 한 화면 틀에 `kind`별 데이터와 표를 연결합니다. 스토리 상세 리포트는 리포트 표의 스토리 이름에서 열립니다. 스토리 편집은 [DemoStoryEditPage.tsx](src/page/demo/story/detail/DemoStoryEditPage.tsx), 신규 등록은 [DemoStoryCreatePage.tsx](src/page/demo/story/new/DemoStoryCreatePage.tsx)를 사용하고, 두 Page는 [StoryEditorView.tsx](src/page/demo/story/shared/StoryEditorView.tsx)의 section 기반 편집 layout을 공유합니다. 신규 등록은 빈 입력과 패키지 선택 상태로 시작합니다. 검수의 두 변형은 `/demo/review/:storyId` route에서 `mode` query로 나눕니다. 이 예시 화면은 공통 UI를 실제 조합해 볼 수 있으며, 데이터 화면의 skeleton은 [useDemoLoading.ts](src/page/demo/shared/useDemoLoading.ts) 기준으로 300ms 표시합니다.

## 재사용 Hook

- [useSelection.ts](src/hook/useSelection.ts): row key와 선택 key 목록을 기반으로 개별/전체 선택 상태를 계산합니다.
- [usePendingNavigation.ts](src/hook/usePendingNavigation.ts): pending 상태에서 navigation 중복 실행을 막습니다.
- [useStickyTableHeader.ts](src/hook/useStickyTableHeader.ts), [useObservedElementHeight.ts](src/hook/useObservedElementHeight.ts): 관찰한 크기에 맞춰 표 머리글 위치를 조정합니다.
- [useSectionNavigation.ts](src/hook/useSectionNavigation.ts): section ID와 offset을 기준으로 현재 section 이동을 관리합니다.
- [useDemoLoading.ts](src/page/demo/shared/useDemoLoading.ts): demo 페이지가 300ms loading skeleton을 재사용합니다.

## 조합 규칙

같은 역할 내부는 상대 경로를, 역할을 넘어갈 때는 @/ alias와 구체 source 파일을 사용합니다. 제품 화면은 위 공통 component를 조합해 label, data, event handler를 전달합니다. API schema, product role, 저장, authorization, brand name, endpoint는 template component 안에 넣지 않습니다.
