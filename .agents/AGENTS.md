# Agent Kit 안내

## 담당 경계

- 이 폴더는 소비 프로젝트에 설치하는 reference와 `dix-admin-` project-local Skill source를 소유합니다.
- 설치·갱신 정책은 [Agent Kit 설치 안내](references/agent-kit-installation.md), 아키텍처는 [Frontend 아키텍처](references/frontend-architecture.md), 실제 명령은 [도구 명세](references/spec.md)를 기준으로 합니다.
- 이 `AGENTS.md`는 저장소 내부 작업 안내입니다. 소비 프로젝트로 자동 복사되는 문서로 취급하지 않습니다.

## 변경 지도

| 변경                     | 함께 확인할 대상                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Reference 추가·이름 변경 | `scripts/install-agent-kit.mjs`, `scripts/verify-agent-kit-install.mjs`, 소비 프로젝트 안내, `scripts/verify-agent-docs.mjs`        |
| Skill 추가·이름 변경     | `.agents/skills/dix-admin-*/SKILL.md` metadata, installer allowlist, `scripts/verify-template-skills.mjs`, root `AGENTS.md` routing |
| 설계·구조 변경           | `DESIGN.md`, 관련 reference, source verifier와 이 영역의 Skill                                                                      |

- Skill의 `name`은 디렉터리 이름과 같은 `dix-admin-` 접두사를 사용합니다. 외부 설치용 파일 목록과 내부 source 경로를 혼동하지 않습니다.
- Reference 문서의 링크·명령·경로를 바꾸면 소비 프로젝트가 실제로 설치하는 파일 목록과 verifier가 모두 같은 계약을 검사하는지 확인합니다.
- 설명 문서는 한국어로 작성합니다. 표준 명칭, 명령, API 필드명은 원문을 유지할 수 있습니다.
