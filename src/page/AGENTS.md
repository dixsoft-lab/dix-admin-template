# Page 안내

## 담당 경계

- `page/`는 화면 단위 composition을 둡니다. 재사용 가능한 UI는 `component/`에, 제품 API·Domain·business rule은 consumer 프로젝트의 책임 위치에 둡니다.
- Route page는 `src/page/{route}/{Route}Page.tsx`에 둡니다. 자원에 속한 하위 route는 해당 route 폴더 아래에 둡니다. 예: `item/ItemPage.tsx`, `item/detail/ItemDetailPage.tsx`.
- Page component는 각 route 폴더에 하나만 둡니다. 서로 다른 화면을 한 `*Pages.tsx` 파일이나 폴더에 모으지 않습니다. 같은 화면을 여러 path에서 공유하는 경우에만 하나의 Page가 route parameter나 prop으로 상태를 구분합니다.
- 화면 밖에서 공유하는 module은 소유 경계의 `shared/` 또는 route/domain folder에 둡니다. Page component끼리 import해 재사용하지 말고, route별 Page element는 `app/`에서 조립합니다.
- 제품 화면은 `App`의 consumer router와 해당 consumer의 Navigation에 등록합니다. Template route helper를 사용한다면 path, explicit `Route`, route handle, page element 연결을 함께 확인합니다.
- 각 화면은 실제 화면과 같은 형태의 `PageSkeleton`을 두고 데이터 대기 상태에 연결합니다. 공통 Shell은 페이지별 loading 때문에 교체하지 않습니다.
- Shell이 제공하는 폭 제한 없는 공통 본문 프레임과 바깥 여백을 사용합니다. page root에 별도 최대 너비나 바깥 padding을 추가하지 않고, 필요한 너비 제한은 폼·카드 같은 내부 영역에만 적용합니다.
- 공통 색상·타이포그래피·table·form·overlay 사용 규격은 [DESIGN.md](../../DESIGN.md), route·layer 계약은 [Frontend 아키텍처](../../.agents/references/frontend-architecture.md)를 따릅니다.

## 변경 규칙

- Page와 이름이 대응하는 `PageSkeleton`을 같은 module에 둡니다. Skeleton은 실제 콘텐츠의 폭·행 수·평균 텍스트 길이를 반영합니다.
- 같은 page 내부는 상대 경로, 다른 역할을 건널 때는 `@/` 공개 source 경로를 사용합니다. `index.ts` barrel을 만들지 않습니다.
- Consumer-owned page·route·data가 template 공통 source의 auth, permission, brand, API 구현이 되지 않도록 경계를 유지합니다.
