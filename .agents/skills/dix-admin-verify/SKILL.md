---
name: dix-admin-verify
description: "Dix Admin의 변경 검증, 회귀 확인, 문서·Skill 정합성 검사 또는 전달 evidence를 준비할 때 사용한다."
metadata:
  version: "1.1.0"
---

# Dix Admin 변경 검증

## 적용 시점

구현 후 회귀 확인, topology·provider 변경, architecture·route·문서·Skill 갱신, 변경 전달 전 evidence 점검에 적용한다.

## 참조

- [도구 명세](../../references/spec.md): 설치된 명령과 CI의 실제 범위.
- [Frontend 아키텍처](../../references/frontend-architecture.md): 검증할 source 책임과 route 계약.
- [소비 프로젝트 안내](../../references/consumer-guide.md): clean consumer matrix와 예제 검증.

## 작업 순서

1. 변경 파일과 영향을 받는 공개 API·route·consumer를 확인하고 검증 scenario를 정한다. 기존 결과를 현재 source의 통과 근거로 재사용하기 전에 source 상태를 비교한다.
2. 앱 변경은 typecheck·관련 test·build와 해당 source gate를 실행한다. Provider·topology 변경은 clean install matrix를, 문서·Skill 변경은 실제 경로·명령·metadata 검사를 실행한다.
3. Verifier를 변경하면 정상 source와 해당 negative fixture를 모두 실행한다. 실패 fixture는 예상 exit와 구체적인 진단을 확인하며 단순 비정상 종료를 성공으로 세지 않는다.
4. UI 변경의 실제 browser 관측은 설치된 승인 `omo:browser` Skill을 먼저 읽고, 사용 가능한 `connectBuiltinBrowser()` 경로로 수행한다. 내장 연결을 사용할 수 없으면 사유를 기록하고 browser 검증을 미완료로 남긴다. 다른 engine이나 headless fallback으로 우회하지 않는다.
5. 실패를 고친 뒤 영향을 받은 scenario를 다시 실행한다. 검증 후 관련 source가 바뀌면 해당 결과를 갱신하고, 실제 관측 범위에 맞춰 보고한다.

## 검증

| 변경 경계                | 실행 명령                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 타입·동작·산출물         | `npm run typecheck`, `npm test -- --run`, `npm run build`                                                           |
| 앱 배치·adapter          | `npm run verify:template-layout`, `npm run verify:template-contracts`                                               |
| Domain·역할·route        | `npm run verify:template-domain-boundary`, `npm run verify:template-architecture`, `npm run verify:template-routes` |
| Provider·topology        | `npm run verify:design-system-modes`, `npm run verify:consumer-modes`                                               |
| 소비 예제·문서           | `npm run verify:consumer-docs`, `node scripts/verify-agent-docs.mjs`                                                |
| Skill metadata·참조·명령 | `node scripts/verify-template-skills.mjs`                                                                           |

직접 `node` 명령은 npm alias 등록 여부와 관계없이 실행한다. Fixture 이름과 진단은 해당 verifier source와 `--fixture=unknown` 안내를 읽는다. UI browser에서는 login/logout·탐색·form/table 상태, modal keyboard·focus·top layer·reduced-motion, 의도하지 않은 backend network 요청을 관측한다.

## 경계

- jsdom·static source·build 성공은 실제 browser·backend·hosted CI·배포 성공을 증명하지 않는다. 각 결과를 별도 evidence로 기록한다.
- 실패를 숨기는 shell pipeline, 실행하지 않은 명령, 빈 로그 또는 미설치 도구를 통과로 기록하지 않는다.
- 검증 자체는 commit·push·merge·publish·deploy 권한을 추가하지 않는다. 전달 동작은 현재 사용자 요청과 저장소 지침을 따른다.

## 증거

각 scenario마다 명령·실행 환경·source 상태, exit code 또는 관측된 화면/요청, raw log·screenshot·trace 경로를 남긴다. Browser 연결 실패나 provider 확인 불가도 정확한 이유와 함께 기록한다. 생성한 임시 fixture와 server/session은 본인이 만든 것만 정리한다.
