#  Next.js 프로젝트 설정 가이드

##  프로젝트 생성

``` bash
npx create-next-app@latest
```

선택 옵션: - TypeScript - ESLint - TailwindCSS - src/ 디렉토리 - App
Router - Import Alias (`@/*` 기본값)

권장 구조:

    my-project/
     ├─ public/
     ├─ src/
     │   ├─ app/
     │   ├─ components/
     │   ├─ styles/
     │   └─ utils/
     ├─ eslint.config.mjs
     ├─ next.config.js
     └─ package.json

------------------------------------------------------------------------

##  IDE & 플러그인

-   **VS Code 타입 검사 활성화**
    1.  `Ctrl/⌘ + Shift + P`
    2.  *TypeScript: Select TypeScript Version* 검색
    3.  *Use Workspace Version* 선택
-   자동완성, 타입 검사, ESLint 검사 지원

------------------------------------------------------------------------

##  ESLint 설정

-   Next.js는 ESLint 기본 내장
-   `package.json`에 추가:

``` json
"scripts": {
  "lint": "next lint"
}
```

-   실행:

``` bash
npm run lint
```

-   설정 옵션:
    -   **Strict**: ESLint + Core Web Vitals (추천)
    -   **Base**: 기본 ESLint만

> Next.js 13+에서는 `eslint.config.mjs` 기본 사용\
> (동적 설정 가능, 유지보수에 유리)

------------------------------------------------------------------------

##  경로 별칭(alias)

`tsconfig.json` 또는 `jsconfig.json`에 추가:

``` json
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@/styles/*": ["styles/*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

사용 예시:

``` ts
// Before
import { Button } from '../../../components/button'

// After
import { Button } from '@/components/button'
```

------------------------------------------------------------------------

##  Core Web Vitals

Next.js ESLint에서 기본 지원하는 성능 지표: - **LCP**: 가장 큰 요소 표시
속도 - **FID**: 첫 입력 반응 속도 - **CLS**: 화면 안정성

------------------------------------------------------------------------

##  pnpm 소개

-   **빠른 설치 속도** (캐시 재사용)
-   **디스크 공간 절약** (하드 링크 활용)
-   **효율적인 의존성 관리**

명령어 비교:

  -------------------------------------------------------------------------------
  작업              npm                   pnpm                yarn
  ----------------- --------------------- ------------------- -------------------
  설치              `npm install`         `pnpm install`      `yarn`

  패키지 추가       `npm install pkg`     `pnpm add pkg`      `yarn add pkg`

  패키지 삭제       `npm uninstall pkg`   `pnpm remove pkg`   `yarn remove pkg`

  스크립트 실행     `npm run dev`         `pnpm dev`          `yarn dev`
  -------------------------------------------------------------------------------

------------------------------------------------------------------------

