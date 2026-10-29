---
name: dix-admin-data
description: "Dix Admin 소비 프로젝트의 API, 응답 schema, Query, Mutation, cache 또는 인증·권한 adapter를 실제 backend에 연결할 때 사용한다."
metadata:
  version: "1.1.0"
---

# 소비 프로젝트 데이터 연결

## 적용 시점

조회·변경·업로드 API 연결, 외부 응답 검증, cache·invalidation, 실제 auth·permission adapter 구현에 적용한다.

## 참조

- [Frontend 아키텍처](../../references/frontend-architecture.md): 소비 기능과 데이터 흐름.
- [소비 프로젝트 안내](../../references/consumer-guide.md): adapter contract와 production 전환.
- [도구 명세](../../references/spec.md): 현재 설치 도구와 consumer가 추가할 dependency 경계.

## 작업 순서

1. Consumer의 공식 API 계약과 실제 backend를 확인하고 요청·응답·오류·권한의 소유자를 정한다. Template에는 Query·Validation Schema·backend SDK가 설치되어 있지 않으므로 기존 consumer 도구를 먼저 확인한다.
2. 소비 앱의 기존 architecture에서 소유하는 기능 또는 Domain module에 요청과 응답 Validation Schema를 선언한다. 필드 타입·필수 여부·null·배열 요소를 검증하고, 요청 대상 일치 확인과 화면 model 변환은 별도 단계로 둔다.
3. `UI → Query/Mutation Hook → Domain API → transport → backend` 흐름을 만든다. 조회는 Query, 생성·변경·삭제·업로드·사용자 명령은 Mutation으로 연결한다.
4. Query key에 결과를 바꾸는 세션·식별자·filter를 포함한다. 변경 뒤 invalidation, logout·권한 변경의 cache 정리, 취소·늦은 응답 처리 정책을 정한다.
5. API 결과를 `AuthAdapter`·`PermissionAdapter` 또는 화면의 loading·empty·error·pending prop으로 변환한다. 추가한 library의 manifest·lock·spec을 함께 갱신한다.

## 검증

소비 앱의 `typecheck`, `build`와 해당 API·Hook의 test를 실행한다. 정상 응답, malformed 응답, 오류·취소·재시도, 중복 명령, 권한 변경 뒤 늦은 응답을 실제 계약에 맞춰 검증한다. Template contract source를 수정하면 `npm run verify:template-architecture`와 `npm run verify:template-contracts`도 실행한다.

## 경계

- UI에서 transport를 직접 호출하며 별도 요청 상태를 복제하지 않는다. 공통 UI와 theme에는 Domain schema·endpoint·backend SDK를 넣지 않는다.
- Unknown capability는 deny한다. Server authorization은 요청마다 인증·권한·자원 소유권을 판정해야 하며 client menu·guard·demo 인증으로 대체할 수 없다.
- HTTP 성공과 Business Logic 성공이 다른 API는 공식 계약의 성공·오류 필드를 따른다. 특정 provider의 응답 형식을 다른 프로젝트에 강제하지 않는다.
- Credential·서버 secret을 client source나 `VITE_*` 값에 두지 않는다. Backend 변경·배포 권한은 현재 사용자 요청의 범위에서 별도로 확인한다.

## 증거

확인한 API 계약, schema·model 변환, Query key·invalidation·권한 경계, 재현 scenario와 exit/log를 남긴다. Local fixture 통과와 실제 backend·provider 실행 결과를 구분한다.
