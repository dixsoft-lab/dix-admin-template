---
name: dix-admin-feature
description: "Dix Admin 소비 프로젝트에 제품 화면, 업무 기능, Domain model 또는 Business Logic을 추가할 때 사용한다."
metadata:
  version: "1.1.1"
---

# 소비 프로젝트 기능 구현

## 적용 시점

관리 화면의 실제 제품 기능, 사용자 과업, 재사용 Domain model을 소비 프로젝트에 추가할 때 적용한다.

## 참조

- [Frontend 아키텍처](../../references/frontend-architecture.md): Template 역할과 소비 프로젝트의 소유 경계.
- [소비 프로젝트 안내](../../references/consumer-guide.md): template 기반 화면 조립과 데이터 흐름.
- [데이터 Skill](../dix-admin-data/SKILL.md): 실제 API·Query·Mutation 연결이 필요한 경우에 읽는다.

## 작업 순서

1. 소비 앱의 기존 architecture와 사용자 과업을 읽고 화면, 업무 기능, Domain model, API의 소유 모듈을 정한다. 소비 앱이 이미 FSD를 사용한다면 기존 page·feature·entity 경계를 따르고, 다른 architecture라면 새 구조를 강제하지 않는다.
2. 제품 기능·Domain model·API를 소비 앱에 구현한다. Template의 `page`, `layout`, `component`, `contract` 역할에 제품 전용 slice를 추가하지 않는다.
3. Template의 controlled UI에 표시 값·상태·callback을 전달한다. 업무 판단은 제품 기능에, 데이터 요청은 소비 앱의 API·Query·Mutation 경계에 둔다.
4. 제품별 인증 상태와 capability를 Template의 authentication·authorization contract로 변환한다. UI guard는 서버 authorization을 대신하지 않는다.
5. 새 화면에 실제 layout에 맞춘 페이지 전용 `PageSkeleton` component를 만들고, 개별 route element를 `<Suspense fallback={<PageSkeleton />}>`로 감싸 Shell을 유지한다. 비-Suspense Query의 `isLoading` 상태는 분기를 유지하고 같은 skeleton을 재사용한다. empty·error 상태는 loading과 분리한다.
6. 새 화면을 실제 route element·handle·navigation에 연결한다. 경로 변경에는 [Route Skill](../dix-admin-route/SKILL.md)을 적용하고 page fallback 기준은 [Frontend 아키텍처](../../references/frontend-architecture.md#페이지별-loading-fallback)를 따른다.

## 검증

소비 앱의 typecheck·test·build와 변경 기능의 정상·오류·pending scenario를 실행한다. Template source를 함께 수정하면 `npm run verify:template-architecture`, `npm run verify:template-domain-boundary`, `npm run verify:template-contracts` 중 변경 경계에 맞는 gate를 실행한다.

## 경계

- 공통 UI·Hook·contract에 제품 API나 Business Logic을 넣지 않는다. 실제 사용처가 없는 빈 모듈과 명목상 abstraction을 만들지 않는다.
- Template demo를 제품 Feature나 서버 보안 경계로 사용하지 않는다. 실제 기능은 consumer가 소유한다.
- Component·Provider는 PascalCase, export Hook은 `useXxx`, 일반 모듈은 kebab-case로 작성한다. React component는 `const` arrow function을 사용한다.

## 증거

새 기능의 소비 모듈, Template 공개 contract 연결, 사용자 과업의 정상·오류·pending 관측과 검증 로그를 남긴다.
