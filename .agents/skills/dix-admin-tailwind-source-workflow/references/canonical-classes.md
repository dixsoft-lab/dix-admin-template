# Tailwind 권장 표기 검사

## 서로 다른 검사

| 검사                | 확인하는 범위                                             |
| ------------------- | --------------------------------------------------------- |
| 실제 Tailwind build | CSS entry·source 탐색·bundle에서 utility CSS가 생성되는지 |
| `npm run lint`      | ESLint의 Tailwind class 줄바꿈 규칙                       |
| 권장 표기 script    | 정적 class 문자열의 Tailwind 생성 여부와 권장 표기 제안   |
| Prettier            | `.prettierrc`에 따른 파일 포맷                            |

한 검사의 성공으로 다른 검사를 통과했다고 표현하지 않습니다. canonical 검사 결과를 직접 수집하지 않았다면 검사 완료로 보고하지 않습니다.

## 읽기 전용 검사 명령

저장소 root에서 실행합니다. `--path`는 여러 번 지정할 수 있습니다.

```sh
node .agents/skills/dix-admin-tailwind-source-workflow/scripts/check-canonical-classes.mjs \
  --root . \
  --stylesheet src/style/tailwind.css \
  --path src \
  --root-font-size 16
```

짧은 class 목록은 파일 대신 `--classes`로 확인할 수 있습니다.

```sh
node .agents/skills/dix-admin-tailwind-source-workflow/scripts/check-canonical-classes.mjs \
  --root . \
  --stylesheet src/style/tailwind.css \
  --classes 'bg-[var(--color-canvas)] text-[length:var(--text-body)]' \
  --root-font-size 16
```

## 검사 script의 범위

- 대상 프로젝트의 `typescript`, `tailwindcss`, `@tailwindcss/node`를 사용하며 dependency를 설치하지 않습니다.
- TS·TSX·JS·JSX 계열 파일에서 정적 string과 template 조각을 읽습니다. `.git`, `node_modules`, `dist`와 심볼릭 링크는 순회하지 않습니다.
- 설치된 Tailwind가 CSS를 생성하는 후보를 기준으로 권장 표기 차이를 보고합니다. 미해석 class, 동적 최종 문자열, Vue·Svelte·HTML template, CSS 충돌, 화면 동등성은 검증하지 않습니다.
- 검사 결과에는 source 탐색·모든 lint·시각 동등성의 보증이 포함되지 않습니다. 실제 build와 필요한 화면 관찰을 별도로 수행합니다.
- Tailwind 내부 `__unstable__loadDesignSystem`와 `canonicalizeCandidates`에 의존합니다. 현재 설치 버전에서 API가 없거나 동작하지 않으면 종료 코드 2로 실패하며 성공으로 간주하지 않습니다.
- script는 파일을 수정하지 않습니다. 권장 표기 제안을 검토하고 직접 수정한 뒤 같은 범위를 다시 검사합니다.

종료 코드 0은 검사 범위의 추가 제안 없음, 1은 제안 있음, 2는 입력·dependency·API 오류를 뜻합니다.
