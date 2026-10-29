# Script 안내

## 담당 경계

- `app-build-config.mjs`는 Vite 앱의 build 설정을 구성하고, 대응 테스트는 `app-build-config.test.ts`에 둡니다.
- `verify-*.mjs`는 앱 구조·계약·route·provider·consumer·문서·Skill의 source gate입니다. 기준 문서는 [도구 명세](../.agents/references/spec.md)입니다.
- `verify-template-architecture.mjs`는 page route 폴더에 `*Page` component가 하나만 있는지도 검사합니다. 이 규칙과 fixture를 바꾸면 [page 안내](../src/page/AGENTS.md) 및 아키텍처 reference도 함께 갱신합니다.
- `install-agent-kit.mjs`는 reference와 Skill의 소비 프로젝트 설치 범위를 정합니다.

## 변경 규칙

- 새 source 검증기를 추가하면 `package.json` script, `.agents/references/spec.md`의 명령 표, 관련 CI workflow와 이 안내를 함께 갱신합니다.
- `verify-agent-docs.mjs`는 검사 대상 문서 경로를 명시적으로 관리합니다. AGENTS 문서를 추가하거나 옮기면 `docPathList`도 갱신해 내부 링크를 검사합니다.
- `remove-demo.mjs`는 명시한 Demo directory와 Demo 진입 표식만 제거합니다. 경로 목록을 넓히거나 저장소 전체를 정리하지 말고, `--dry-run` 계획과 문서 링크 처리를 유지합니다.
- `--fixture` 검증은 가능한 경우 메모리 안의 문서·source 변경으로 실패를 재현합니다. 저장소 파일을 덮어쓰거나 fixture 입력을 고치지 않습니다.
- Consumer 설치 검증이 만드는 임시 폴더와 evidence는 검증기가 소유한 범위만 정리합니다. `fixtures/consumer-agent-kit/**/AGENTS.md`는 verifier 입력이므로 프로젝트 안내 문서로 등록하거나 변경하지 않습니다.
- 검증기는 정상 입력의 성공뿐 아니라 관련 negative fixture의 종료 코드와 구체 진단을 확인합니다.
