# 파일명과 코드 식별자 규칙

## 적용 범위

이 규칙은 template source, demo 화면, 검증 script, 문서에 적용합니다. 외부 API·SDK·protocol·도구가 정한 이름과 공개 URL은 원래 계약을 유지합니다. 새 파일을 만들거나 이름·위치를 바꾸기 전에 역할에 맞는 파일명과 식별자를 정합니다.

## 파일명

| 역할                                         | 규칙                        | 예시                                                                |
| -------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| React component·Provider                     | 주 식별자와 같은 PascalCase | `ModalView.tsx`, `DesignSystemProvider.tsx`                         |
| export React custom Hook·Query/Mutation Hook | `use` + PascalCase 식별자   | `useDocumentTitle.ts`, `useSelection.ts`                            |
| React Zustand store                          | `use` + 도메인 + `Store`    | `useToastStore.ts`                                                  |
| API·계약·schema·model·type·utility·CSS       | 책임을 설명하는 kebab-case  | `auth-adapter.ts`, `demo-record.ts`, `tailwind.css`                 |
| 일반 폴더·문서·script                        | kebab-case                  | `document-title/`, `naming-conventions.md`, `verify-agent-docs.mjs` |
| 단위 테스트                                  | 대상 파일 이름 뒤에 `.test` | `useDocumentTitle.test.tsx`, `ModalView.test.tsx`                   |
| 도구·공개 package가 고정한 진입점            | 고정 이름과 공개 계약 유지  | `main.tsx`, `index.d.ts`, `vite.config.ts`                          |

JSX가 있으면 `.tsx`, 없으면 `.ts`를 씁니다. component가 쓰는 type·model이라고 해서 PascalCase 파일명을 사용하지 않습니다. 여러 module에서 쓰는 Hook은 component 파일에서 export하지 않고 독립 Hook 파일에 둡니다. 독립 Hook을 한 파일에 무관하게 모으지 않습니다.

## 코드 식별자와 단수형

| 대상                           | 규칙                         | 예시                                                    |
| ------------------------------ | ---------------------------- | ------------------------------------------------------- |
| component·type·interface·class | PascalCase                   | `DocumentTitle`, `AuthenticatedUser`                    |
| 함수·변수·객체·props           | camelCase, 단수형            | `setTitle`, `record`, `activePath`                      |
| React Hook                     | `use`로 시작하는 camelCase   | `useDocumentTitle`, `useSelection`                      |
| 상수                           | 고정 상수만 UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`                                     |
| 컬렉션                         | 단수 명사 + 자료형 접미사    | `recordList`, `permissionSet`, `routeMap`, `userRecord` |

Dixsoft가 소유하는 폴더명, 함수명, 변수명, 매개변수명과 import alias는 단수형으로 씁니다. 배열·집합·맵도 복수형 대신 원소를 나타내는 단수 명사에 `List`, `Set`, `Map`, `Record`처럼 자료형을 붙입니다. 공개 URL, 외부 API·SDK·protocol field, dependency가 정한 export 이름은 원형을 유지하며 내부 별칭은 저장소의 단수형 규칙을 따릅니다.

## 함수·검증·분기

- React component와 내부 함수는 `const` + arrow function으로 선언합니다. module 공용 utility에만 named function을 허용합니다.
- 외부 data와 API 응답의 field type·필수 여부·null 허용·array element·범위는 프로젝트에서 사용하는 Validation Schema에 선언합니다. `typeof`·null·array 검사를 `&&`·`||`로 길게 나열하는 수동 조건식은 금지합니다. 응답 schema 검증, 요청 대상과 응답의 일치 확인, 화면 model 변환은 분리합니다.
- 여러 조건을 조합하는 Business Rule은 의미를 설명하는 이름으로 표현합니다. 서로 다른 판단을 복잡한 조건식에 섞지 않고 조기 반환·`if`·`switch`를 사용합니다.
- Ternary는 단일 `condition ? valueA : valueB`만 허용합니다. 참·거짓 분기와 JSX 안에서의 중첩도 금지하며, 줄바꿈·괄호로 나눈 경우에도 같은 규칙을 적용합니다.

## 파일 이동과 포맷

1. 파일 역할과 export 식별자를 확인하고 위 표에 맞는 경로·이름을 정합니다.
2. 같은 역할의 기존 파일과 의존 경계를 확인하고, 기존 위반 사례를 새 규칙으로 복제하지 않습니다.
3. 이름을 바꾸면 static/dynamic import, re-export, mock, test 파일명, source verifier와 작업 지도를 함께 갱신합니다.
4. 외부에 노출된 package path·export와 URL은 계약을 확인한 뒤 유지합니다.
5. TypeScript·TSX 수정 후에는 저장소 `.prettierrc`로 `npx --no-install prettier --write <파일>`과 `npx --no-install prettier --check <파일>`을 실행합니다.
