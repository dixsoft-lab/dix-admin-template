# Hook 안내

## 담당 경계

- 이 폴더는 화면 사이에서 재사용하는 interaction state와 browser lifecycle을 다룹니다. 예: selection, section navigation, pending navigation, element measurement, sticky table header, IME composition, document title.
- 특정 route에서만 필요한 상태와 규칙은 해당 Page에 둡니다. 여러 module이 재사용하는 Hook은 별도 파일에 두고 useXxx 이름을 사용합니다.
- Hook은 component·page·layout을 import하지 않습니다. 허용 의존 방향과 공개 source 경로는 [Frontend 아키텍처](../../.agents/references/frontend-architecture.md)를 따릅니다.

## 변경 규칙

- DOM event, ResizeObserver, requestAnimationFrame 등 browser subscription을 추가하면 cleanup을 함께 구현하고 대응 test에서 해제 동작을 확인합니다.
- useSelection은 controlled 상태입니다. 전체 선택은 현재 keyList만 바꾸고 그 밖의 선택은 보존합니다.
- usePendingNavigation은 pending 중 마지막 이동 요청만 보관합니다. pending이 끝나면 실행하고, 취소되면 target을 제거합니다.
- useSectionNavigation은 isReady 뒤에 DOM을 읽고 window scroll·resize 및 section size 변화를 관찰합니다. update는 frame 단위로 합치며 prefers-reduced-motion을 존중합니다.
- DocumentTitleContext와 title utility는 component를 역참조하지 않도록 이 Hook 경계에 둡니다.
- Source unit test는 대상 Hook 옆에 둡니다. DOM test에는 파일별 jsdom 선언과 cleanup을 적용하며 fake timer·global stub을 복구합니다.
- React Hook 규칙을 보존하고 조건부 호출이나 component 전용 JSX를 추가하지 않습니다.
