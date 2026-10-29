# Tailwind CSS source workflow

## 이 저장소의 source 기준

- Tailwind CSS 버전은 `package.json`과 `package-lock.json`을 확인합니다. 현재 앱은 Tailwind CSS `4.3.3`과 `@tailwindcss/vite`를 사용합니다.
- 유일한 CSS entry point는 [`src/style/tailwind.css`](../../src/style/tailwind.css)입니다. 실제 token, `@source`, theme, keyframe과 Vite plugin 연결을 이 파일과 [`vite.config.ts`](../../vite.config.ts)에서 확인합니다.
- Tailwind CSS 4 구성은 CSS-first입니다. 현재 source에 없는 `tailwind.config.js`나 component별 stylesheet를 임의로 만들지 않습니다. UI 표현은 JSX `className` utilities에 둡니다.
- Tailwind class 줄바꿈은 ESLint `eslint-plugin-better-tailwindcss/enforce-consistent-line-wrapping`으로 검사합니다. 클래스 네 개까지 한 줄, group 경계에서 줄을 나누지 않는 `group: "never"`, 제한 없는 `printWidth: 0`, 가능한 경우 한 줄 우선 설정을 사용합니다.
- `.prettierrc`가 포맷 기준입니다. Prettier와 Biome formatter를 함께 실행하지 않습니다. `biome.json`은 import 정렬 설정만 제공하며 Biome package·script는 없습니다. ESLint는 `npm run lint`로 실행합니다.
- ESLint는 canonical Tailwind utility 여부를 검사하지 않습니다. 필요하면 [`dix-admin-tailwind-source-workflow`의 읽기 전용 검사 script](../skills/dix-admin-tailwind-source-workflow/references/canonical-classes.md)를 실행합니다. class 줄바꿈이나 실제 CSS 생성 결과를 canonical 표기 검증으로 표현하지 않습니다.

## 작업 순서

1. [Frontend 아키텍처](frontend-architecture.md), [디자인 시스템](../../DESIGN.md), [도구 명세](spec.md)와 naming convention을 읽습니다.
2. `package.json`·lockfile에서 Tailwind와 lint 도구의 실제 버전을 보고 `tailwind.css` 및 Vite entry point를 확인합니다.
3. 기존 token·component·class utility를 재사용합니다. CSS 파일을 새로 만들거나 style을 component 밖으로 분리하지 않습니다.
4. Tailwind utility 변경 뒤 `npm run lint`로 class 줄바꿈을 검사합니다. TypeScript·TSX 수정은 Prettier write 후 check를 실행합니다.
5. 관련 UI가 바뀌면 해당 source 검증과 browser 화면 확인을 별도로 기록합니다. Build·jsdom은 실제 browser 배치나 hover·focus를 증명하지 않습니다.

## 검증 명령

```sh
npm run lint
npx --no-install prettier --write <파일>
npx --no-install prettier --check <파일>
npm run typecheck
npm run build
node .agents/skills/dix-admin-tailwind-source-workflow/scripts/check-canonical-classes.mjs --root . --stylesheet src/style/tailwind.css --path src --root-font-size 16
```

마지막 명령은 권장 표기 검사가 필요할 때 실행합니다. Tailwind 내부 unstable API가 없거나 실패하면 검사 결과를 확인할 수 없는 상태로 남깁니다.

## 경계

- Tailwind version을 올리면 CSS-first entry와 plugin을 함께 재검증하고 `package.json`, lockfile, 도구 명세를 갱신합니다.
- ESLint plugin 설정은 실제 Tailwind entry point를 가리켜야 합니다. workspace나 소비 앱으로 옮길 때 각 CSS entry와 Tailwind source 경로를 다시 확인합니다.
- USP-web 전용 source map, 제품 theme, unstable canonicalization API는 template source 계약으로 복사하지 않습니다.
