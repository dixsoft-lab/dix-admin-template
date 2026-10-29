# Layout 안내

## 담당 경계

- Shell, Sidebar, Navigation은 공통 Admin frame을 구성합니다. route 화면의 콘텐츠는 Shell의 children으로 렌더링합니다.
- Shell은 AuthBoundary, DocumentTitle, Sidebar와 공통 본문 frame을 연결합니다. consumer가 auth·permission·brand·navigation·active path·home path를 주입합니다.
- Sidebar는 브랜드 홈 링크, 메뉴, 사용자 정보, 로그아웃 action을 배치합니다. Navigation은 전달된 item list를 capability 기준으로 거르고 현재 path와 링크 동작을 표현합니다.
- 제품별 메뉴 목록과 실제 인증·권한 판단은 consumer 소유입니다. 공통 layout에 제품별 route, API, role, business rule을 넣지 않습니다.
- Navigation은 exact path를 우선 활성화하고, exact match가 없으면 query를 제외한 path와 하위 path를 비교합니다. Router anchor에는 basename을 적용하고 onNavigate에는 app-local path를 전달합니다.

## 변경 규칙

- 메뉴를 추가하거나 section·capability를 바꾸면 navigation contract와 메뉴 추가 Skill을 확인합니다. Sidebar에 제품별 메뉴를 직접 하드코딩하지 않습니다.
- 브랜드 링크 목적지는 필수 Shell.homePath prop으로 전달합니다. Router 안에서는 Link가 basename을 적용하게 두고, 별도 절대 경로를 조립하지 않습니다.
- Sidebar의 logo 변경은 favicon 동기화도 확인합니다. 해당 연결은 component/metadata/brand-favicon.ts에 있습니다.
- 공통 frame의 폭·간격·반응형 규칙은 DESIGN.md를 따릅니다. Page마다 Sidebar 폭이나 본문 max-width를 다시 정의하지 않습니다.
- Source test는 해당 component 옆에 둡니다. jsdom test는 실제 browser focus·responsive layout 검증을 대신하지 않습니다.
