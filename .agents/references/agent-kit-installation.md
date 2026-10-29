# Project-local Agent Kit 설치와 갱신

이 절차는 Admin 앱 root를 대상으로 합니다. Standalone에서는 저장소 root, monorepo에서는 Admin workspace root를 `--target`으로 지정합니다. 기존 사용자 Skill과 문서는 그대로 둡니다.

## 표준 Skills CLI

검증 버전은 `skills@1.7.4`입니다. 소비 프로젝트 root에서 실행하며 `--agent codex --copy`는 `.agents/skills`에 실제 파일을 복사합니다. `--all`은 모든 agent를 포함하므로 사용하지 않습니다.

이 CLI 버전은 Node.js `>=22.20.0`을 요구합니다. Admin 앱과 template 명령의 Node.js 지원 하한은 `20.19.0`이며, Skills 설치 명령만 Node.js `22.20.0` 이상인 환경에서 실행합니다.

```sh
cd /absolute/path/to/consumer-admin
npx --yes skills@1.7.4 add /absolute/path/to/dix-admin-template --agent codex --skill dix-admin-route --copy --yes
npx --yes skills@1.7.4 add /absolute/path/to/dix-admin-template --agent codex --skill '*' --copy --yes
```

Private GitHub source는 해당 저장소를 읽을 Git 인증이 준비된 환경에서 다음 문법을 사용합니다. 로컬 fixture에서는 원격 인증·저장소 접근을 검증하지 않습니다.

```sh
npx --yes skills@1.7.4 add bwlee-dix/dix-admin-template --agent codex --skill '*' --copy --yes
```

Skills CLI는 Skill directory를 설치하지만 이 template의 sibling `.agents/references`와 root `AGENTS.md` routing을 설치하지 않습니다. 따라서 완전한 설치·갱신에는 아래 companion installer를 실행합니다. 선택한 Skill만 설치한 상태는 전체 Agent Kit 설치 완료가 아닙니다.

## 완전한 설치와 반복 갱신

```sh
node /absolute/path/to/dix-admin-template/scripts/install-agent-kit.mjs --target /absolute/path/to/consumer-admin
```

처음과 갱신에 같은 명령을 사용합니다. 검토한 template revision으로 checkout한 뒤 실행하며 일곱 `dix-admin-*` Skill, 여섯 reference 문서, 디자인 시스템 문서, Tailwind Skill의 명세·검사 자산과 소유권 manifest만 복사합니다. root `DESIGN.md`는 소비 프로젝트의 기존 문서와 충돌하지 않도록 `.agents/references/dix-admin-design-system.md`에 설치합니다. Skills 사이 sibling link와 naming·Tailwind workflow 문서가 해석되도록 전체 kit를 설치합니다. AGENTS의 `<!-- dix-admin-template:start -->`와 `<!-- dix-admin-template:end -->` 사이만 교체하며 바깥 text는 보존합니다.

기존 reference 경로에 내용이 다른 사용자 문서가 있으면 덮어쓰지 않고 중단합니다. 이전 설치 manifest가 소유한 파일은 갱신 대상이므로 소비 프로젝트에서 그 파일을 수정했다면 먼저 별도 보존·검토합니다. Source를 제거해도 소비 프로젝트에는 실제 복사본이 남습니다. Installer는 obsolete 파일을 삭제하지 않습니다.

`--global`과 `-g`, home/root target, symlink 대상, 손상되거나 중복된 managed marker를 거부합니다. Marker·경로·충돌 검사는 파일 쓰기 전에 수행합니다. 파일시스템 쓰기 중 디스크 오류에 대한 transaction rollback은 제공하지 않습니다.

Reference 문서 안의 앱 source·명령 링크는 동일 template 기반 Admin 앱을 전제로 합니다. 임의의 빈 프로젝트에 Agent Kit만 설치하면 Skill의 문서 링크는 해석되지만 앱 source·검증 명령까지 설치되지는 않습니다.

## 검증

```sh
npm run verify:agent-kit-install
npm run verify:agent-kit-install -- --fixture=consumer-with-existing-agents
npm run verify:agent-kit-install -- --fixture=malformed-managed-marker
npm run verify:agent-kit-install -- --fixture=global-install-request
```

Verifier는 독립 temporary consumer, HOME·npm cache·XDG 경로를 만들고 고정 버전 CLI의 selected/all 설치를 실행합니다. 실제 사용자 global agent directory는 사용하지 않습니다. 성공하면 verifier가 만든 consumer·cache·HOME만 정리하고 별도 evidence directory는 보존합니다. 실패한 temporary directory는 진단을 위해 보존합니다. Negative fixture는 installer exit 1과 설치 전후 동일 hash를 기대하므로 verifier 자체는 기대대로 거부되면 exit 0입니다. JSON report와 로그 위치는 stdout에 표시합니다. `DIX_AGENT_KIT_EVIDENCE_DIR`로 외부 증거 경로를 지정할 수 있습니다.
