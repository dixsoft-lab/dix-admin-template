---
name: dix-admin-feature
description: "Dix Admin 소비 프로젝트에 제품 page, feature, entity 또는 Business Logic을 추가하고 FSD 책임과 공개 API를 정할 때 사용한다."
metadata:
  version: "1.0.0"
---

# 소비 프로젝트 기능 구현

## 적용 시점

관리 화면의 실제 제품 기능, 사용자 과업, 재사용 Domain model을 추가하거나 기존 기능의 FSD 소유권을 조정할 때 적용한다.

## 참조

- [Frontend 아키텍처](../../references/frontend-architecture.md): layer·slice·공개 API와 명명 규칙.
- [소비 프로젝트 안내](../../references/consumer-guide.md): feature 확장과 데이터 흐름.
- [데이터 Skill](../dix-admin-data/SKILL.md): 실제 API·Query·Mutation 연결이 필요한 경우에 읽는다.

## 작업 순서

1. 사용자 과업과 기존 source를 읽고 page의 화면 조립, feature의 독립 과업·Business Logic, entity의 재사용 Domain model 중 소유자를 정한다. 필요한 코드가 생길 때 slice를 만든다.
2. `app → page → widget → feature → entity → shared` 방향을 지킨다. 같은 Domain이 여러 layer에 있으면 같은 단수형 이름을 쓰고, 컬렉션에는 `List`·`Map`·`Set`을 붙인다.
3. Slice 내부는 상대 import, 외부 소비는 `@admin`과 `index.ts` 공개 API를 사용한다. 같은 layer의 다른 slice 결합은 상위 layer에서 조립한다.
4. Page는 공통 UI에 값·상태·callback을 전달한다. 제품 판단은 feature/model에 두고, 데이터 요청은 소유 API·Query·Mutation 경계에 연결한다.
5. 새 화면을 실제 route element·handle·navigation에 연결한다. 경로 변경에는 [Route Skill](../dix-admin-route/SKILL.md)을 적용한다.

## 검증

`npm run verify:template-fsd`, `npm run typecheck`, `npm run build`와 변경 과업의 `npm test -- --run <대상>`을 실행한다. Template core 수정은 `npm run verify:template-domain-boundary`로 제품 누수를 확인한다. Consumer에 필요한 Domain을 추가할 때는 금지 목록의 적용 범위를 명시적으로 조정하고 기존 core 보호 mutation을 유지한다.

## 경계

- 공통 UI·Hook에 제품 API나 Business Logic을 넣지 않는다. 실제 사용처가 없는 빈 slice와 명목상 abstraction을 만들지 않는다.
- Template demo를 제품 Feature나 서버 보안 경계로 사용하지 않는다. 실제 기능은 consumer가 소유한다.
- Component·Provider는 PascalCase, export Hook은 `useXxx`, 일반 module은 kebab-case로 작성한다. React component는 `const` arrow function을 사용한다.

## 증거

새 기능의 소유 layer·slice, 공개 API, 사용자 과업의 정상·오류·pending 관측과 검증 로그를 남긴다. Domain 검사 범위를 바꿨다면 허용 이유와 유지한 core 보호 fixture를 기록한다.
