# 10주차
## 개요

Next.js의 **Server Components / Client Components** 개념에서  
`"use client"` 지시문은 **클라이언트 전용 컴포넌트임을 명시**하는 역할을 합니다.  

이 문서는 `"use client"`의 사용 예시, 데이터 전달 방식, 성능 최적화 방법 등을 다룹니다.

---

##  Client Component 생성

Client Component를 만들려면 파일 맨 위에 `"use client"`를 추가합니다.

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count} likes</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```
 JS 번들 크기 줄이기

"use client"는 최소한의 영역에만 적용하는 것이 좋습니다.

상위 레이아웃 등 큰 컴포넌트 전체에 "use client"를 붙이면 번들 크기가 커집니다.

예시
// app/layout.tsx
```ts
import Search from './search'
import Logo from './logo'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Logo />     {/* 서버 렌더링 가능 */}
        <Search />   {/* 클라이언트 전용 */}
      </nav>
      <main>{children}</main>
    </>
  )
}
```

// app/ui/search.tsx
```ts
'use client'

export default function Search() {
  // ...
}
```

 이렇게 하면 정적인 부분은 서버에서 처리하고,
상호작용이 필요한 Search만 클라이언트에서 동작합니다

 서버 → 클라이언트 데이터 전달

Server Component에서 데이터를 불러오고
Client Component로 props를 통해 전달할 수 있습니다.

// app/[id]/page.tsx
```ts
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  return <LikeButton likes={post.likes} />
}
```
// app/ui/like-button.tsx
```ts
'use client'

export default function LikeButton({ likes }: { likes: number }) {
  // ...
}
```

 주의: Client Component로 전달되는 props는 반드시 직렬화 가능(Serializable) 해야 합니다.

 Server ↔ Client 컴포넌트 섞기 (Interleaving)

Server Component를 Client Component의 children으로 넘길 수 있습니다.

예시
// app/ui/modal.tsx
```ts
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```
// app/page.tsx
```ts
import Modal from './ui/modal'
import Cart from './ui/cart'

export default function Page() {
  return (
    <Modal>
      <Cart /> {/* 서버 컴포넌트 */}
    </Modal>
  )
}
```

 서버 렌더링된 UI를 클라이언트 상태를 가진 컴포넌트 안에 자연스럽게 포함할 수 있습니다.

 React Context 사용하기

React의 Context API는 Server Component에서 직접 지원되지 않음
→ 따라서 Client Component Provider를 만들어 사용합니다.

// app/theme-provider.tsx
```ts
'use client'

import { createContext } from 'react'

export const ThemeContext = createContext({})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
}
```
// app/layout.tsx
```ts
import ThemeProvider from './theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

 팁: Provider는 가능한 한 트리의 깊은 곳에 위치시켜야
Next.js가 정적 부분을 최적화하기 쉽습니다.

 써드파티(Third-party) 컴포넌트 사용

클라이언트 전용 기능(useState, useEffect)을 사용하는
서드파티 컴포넌트는 반드시 Client Component에서만 사용해야 합니다.

// app/gallery.tsx
```ts
'use client'

import { useState } from 'react'
import { Carousel } from 'acme-carousel'

export default function Gallery() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>View pictures</button>
      {isOpen && <Carousel />}
    </div>
  )
}
```

만약 Server Component에서 직접 사용하려 하면 오류가 발생합니다.
이를 해결하려면 래퍼(Wrapper) 를 만들어 감싸줍니다.

// app/carousel.tsx
```ts
'use client'

import { Carousel } from 'acme-carousel'
export default Carousel
```

이제 Server Component에서도 정상적으로 사용할 수 있습니다:

// app/page.tsx
```ts
import Carousel from './carousel'

export default function Page() {
  return (
    <div>
      <p>View pictures</p>
      <Carousel />
    </div>
  )
}
```
📦 라이브러리 제작자를 위한 조언

라이브러리에서 클라이언트 전용 기능(예: useState, useEffect)을 사용하는 엔트리 포인트에는
"use client"를 반드시 추가하세요.

그래야 사용자가 따로 래퍼를 만들 필요 없이 사용할 수 있습니다.

일부 번들러(예: esbuild)는 "use client"를 제거할 수 있으므로,
빌드 설정에서 보존하도록 명시해야 합니다.


# 9주차


# 8주차


# 7주차
-시험

# 6주차

# 5주차

## 0) 빠른 요약
- **`searchParams`**: URL 쿼리 문자열을 읽는 방법. 일부 환경(14.2+/15.x)에서는 **Promise로 전달**될 수 있어 `await` 필요.
- **`[slug]`의 `params`**: 일반적으로 동기 객체이지만, 환경에 따라 **Promise**일 수 있음 → `async` 컴포넌트에서 `await params`.
- **`Link`**: 내부 이동은 `Link` 사용(프리페치/클라이언트 전환). 전역 메뉴는 `app/layout.tsx` 헤더에 두면 모든 페이지에서 노출.

---

## 1) `searchParams`란?
- **정의**: URL의 **쿼리 문자열**을 읽을 때 사용  
  예) `/products?category=shoes&page=2` → `category=shoes`, `page=2`

### (동기 형태, 일반적)
```tsx
// app/products/page.tsx
export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = searchParams.category ?? "all";
  const page = Number(searchParams.page ?? 1);
  return <p>카테고리: {category} / 페이지: {page}</p>;
}
```

### (비동기 형태, 일부 환경/버전 대응: 14.2+/15.x 등)
```tsx
// app/products/page.tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "all";
  const page = Number(sp.page ?? 1);
  return <p>카테고리: {category} / 페이지: {page}</p>;
}
```

> 팁  
> - 타입을 정확히 두면(`Promise<...>` vs 객체) **TS가 `await` 필요 여부를 알려줍니다.**  
> - 쿼리 결합은 `Link`의 `href`에 **객체 형태**로 넘기면 안전합니다.

---

## 2) `[slug]` 동적 라우팅 — `params` 정리 & 메모
- 데이터가 커지면 **`.find()`(O(n)) 대신 DB 인덱스/쿼리**로 대체
- 환경에 따라 `params`가 **Promise**일 수 있음 → **`await` 후 사용**(TS로 잡힘)

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { posts } from "../posts";

type Params = { slug: string };

export default async function PostPage({
  params,
}: { params: Promise<Params> }) {
  const { slug } = await params;           // ← 비동기 해제
  const post = posts.find((p) => p.slug === slug);
  if (!post) return notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 3) `Link` 구성요소 & 전역 메뉴

### 3-1) 블로그 목록에 링크 추가
```tsx
// app/blog/page.tsx
import Link from "next/link";
import { posts } from "./posts";

export default function BlogPage() {
  return (
    <>
      <h2>블로그 목록</h2>
      <ul>
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

### 3-2) 전역 네비게이션(모든 페이지에서 보이게)
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "My App" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>

            {/* 쿼리는 문자열로 직접 써도 되고, 객체로 넘겨도 됩니다. */}
            <Link href="/products?category=shoes&page=1">Products</Link>
            {/* 객체 버전(권장) */}
            {/* <Link href={{ pathname: "/products", query: { category: "shoes", page: 1 } }}>Products</Link> */}
          </nav>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
        <footer style={{ padding: 12, borderTop: "1px solid #ddd" }}>© 2025</footer>
      </body>
    </html>
  );
}
```

> 팁  
> - **내부 이동은 `Link` 사용**(클라이언트 전환 & 프리페치)  
> - **쿼리 조합**:  
>   ```tsx
>   <Link href={{ pathname: "/products", query: { category: "shoes", page: 2 } }} />
>   ```

---

## 4) 경로 방식 비교 — React vs Next.js

### React(기본)
- 외부 라우터 필요(예: `react-router-dom`)
- 코드에서 `<Route>`로 직접 매핑
```tsx
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

### Next.js
- **파일/폴더 기반 자동 매핑(내장)**  
  - `pages/about.tsx` → `/about`  
  - `app/about/page.tsx` → `/about`

---

## 5) Pages Router vs App Router

### Pages Router
- **도입**: 초기 버전(Next 1~12)  
- **위치**: `pages/`  
- **특징**: 익숙한 패턴(라우트/`getStaticProps`/`getServerSideProps`)  
- **현황**: 유지보수 중(신규에는 비권장)

```
pages/
├─ index.tsx       → /
├─ about.tsx       → /about
└─ blog/[slug].tsx → /blog/:slug
```

### App Router (권장)
- **도입**: Next 13+  
- **위치**: `app/`  
- **특징**: 서버 컴포넌트, 레이아웃/템플릿, 로딩 UI, 인터셉트, 병렬 경로 등
```
app/
├─ layout.tsx
├─ page.tsx        → /
└─ about/
   └─ page.tsx     → /about
```

---

## 6) Next.js 내비게이션 작동 개요
- **서버 렌더링**: 기본이 서버 컴포넌트. 정적 빌드/재검증 또는 요청 시 렌더링, 결과는 캐시될 수 있음.
- **프리페치(Prefetch)**: 뷰포트 내/근접 링크를 **사전 로드**하여 체감 속도 향상.
- **스트리밍(Streaming)**: 서버에서 준비된 부분부터 **점진적 전송**으로 TTFB/TTI 개선.
- **클라이언트 전환**: 첫 방문 이후에는 **SPA처럼 부드러운 전환**.

> 기본 기억: **최초 HTML은 서버에서**, 이후 **클라이언트 전환**과 **프리패칭**으로 빠르게 탐색.

---

## 7) 체크리스트 & 트러블슈팅
- `[slug]`/`searchParams`가 **Promise 경고**를 띄우면 → 컴포넌트를 `async`로 만들고 `await` 처리.
- 라우팅이 매칭되지 않으면 → 해당 세그먼트에 **`page.tsx` 또는 `route.ts`**가 존재하는지 확인.
- 구조/폴더 변경 후 캐싱 이슈 → **개발 서버 재기동**으로 해결되는 경우 많음.
- 대용량 데이터에서 `.find()`는 임시. **DB 인덱스/쿼리**로 대체.
- 내부 이동은 항상 **`Link`** 사용(프리페치 혜택).

---


# 4주차

## 빠른 요약
- **Git**: `switch`는 “브랜치 전환 전용”이라 **안전**, `checkout`은 전환 + 파일 복구까지 포함되어 **위험도↑**. 새 브랜치는 `git switch -c <branch>` 권장.  
- **Next.js(App Router)**: **파일 기반 라우팅**. 각 경로 폴더의 `page.tsx`가 페이지, `layout.tsx`가 공용 UI. **중첩 폴더 = 중첩 경로**, `[slug]` 폴더로 **동적 라우팅**.  
- **버전 특이점**: 일부 환경(Next 14.2+/15.x)에서 **`params`가 Promise**로 전달되는 이슈가 보고됨 → 컴포넌트를 `async`로 만들고 `await params` 처리.

---

## 1) Git — 브랜치 전환(Checkout vs Switch)

### 핵심 차이
- `git checkout`  
  - **브랜치 전환 + 파일 복구/수정**(특정 커밋으로 이동, 파일 되돌리기 등)까지 한 명령에 포함  
  - 잘못 쓰면 **Detached HEAD** 등 실수 위험 ↑
- `git switch` (Git 2.23 / 2019 도입)  
  - **브랜치 전환 전용**으로 단순/안전  
  - 실무에서 **전환은 `switch`**를 기본값으로 추천

### 왜 `checkout`이 아직 남아 있나?
- 브랜치 전환 외에 **특정 커밋으로 이동**, **파일 복구** 등 **다기능**을 계속 지원하기 위해서

### 명령어 모음(권장 흐름)
```bash
# 새 브랜치 생성 + 즉시 이동 (권장)
git switch -c <branch>

# (구버전 호환) checkout 방식
git checkout -b <branch>

# 브랜치 이동
git switch <branch>
git checkout <branch>

# 브랜치 생성만 (이동 없음)
git branch <branch>
```

> 팁: **생성/삭제/조회**는 `git branch`, **이동**은 `git switch`로 역할을 분리하면 안전합니다.

---

## 2) Next.js(App Router) — 페이지, 레이아웃, 라우팅

### 기본 개념
- **파일 기반 라우팅**: `app/` 폴더의 디렉터리 구조가 **URL**이 됨  
- **페이지**: 각 경로 폴더의 `page.tsx`(default export 필요)  
- **레이아웃**: `layout.tsx`에서 **공용 UI** 정의(헤더/푸터 등). **상태 보존/재마운트 최소화**

### 가장 작은 예제
```tsx
// app/page.tsx   → GET /
export default function Page() {
  return <h1>Hello Next.js!</h1>;
}

// app/about/page.tsx  → GET /about
export default function AboutPage() {
  return <h1>About</h1>;
}
```

### 전역 레이아웃
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "My App" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header>공통 헤더</header>
        <main>{children}</main>
        <footer>공통 푸터</footer>
      </body>
    </html>
  );
}
```

### 특정 섹션 레이아웃(중첩 레이아웃)
```tsx
// app/dashboard/layout.tsx   → /dashboard 이하에만 적용
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <aside>대시보드 메뉴</aside>
      <div>{children}</div>
    </section>
  );
}
```

---

## 3) 중첩 라우팅 & 동적 세그먼트

### 구조 규칙
- **폴더 = URL 세그먼트**, **파일 = UI/엔드포인트**  
- **동적 세그먼트**: 폴더명을 **`[slug]`** 같이 대괄호로 감싸면 URL 변수로 매칭

```
app/
 ├─ page.tsx                → /
 └─ blog/
    ├─ page.tsx             → /blog
    └─ [slug]/
       └─ page.tsx          → /blog/:slug
```

### 예제 데이터(강의 단순화 버전)
> 일부 문서/예제에서 `@/lib/posts`, `@/ui/post` 같은 별칭 모듈이 없어 **모듈 해석 오류**가 날 수 있으므로, 실습에선 같은 경로에 **로컬 파일**로 둡니다.

```ts
// app/blog/posts.ts
export type Post = {
  slug: string;
  title: string;
  content: string;
};

export const posts: Post[] = [
  { slug: "nextjs",         title: "Next.js 소개",        content: "Next.js는 React 기반의 풀스택 프레임워크." },
  { slug: "routing",        title: "App Router 알아보기", content: "Next.js 13부터 App Router가 도입됨." },
  { slug: "ssr-ssg",        title: "SSR vs SSG",          content: "서버 사이드 렌더링과 정적 사이트 생성 비교." },
  { slug: "dynamic-routes", title: "동적 라우팅",         content: "폴더명을 [slug]로 두면 동적 세그먼트가 생성됨." },
];
```

### 목록 페이지
```tsx
// app/blog/page.tsx   → /blog
import Link from "next/link";
import { posts } from "./posts";

export default function BlogPage() {
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### 상세 페이지(일반 환경)
```tsx
// app/blog/[slug]/page.tsx   → /blog/:slug
import { notFound } from "next/navigation";
import { posts } from "../posts";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function PostPage({ params }: Props) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return notFound();
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 상세 페이지(Next 14.2+/15.x에서 `params`가 Promise인 환경)
> 일부 환경/버전에서 런타임 경고:  
> `Route "/blog/[slug]" used 'params.slug'. 'params' should be awaited before using its properties.`  
> 아래처럼 **컴포넌트를 async**로 만들고 **`await params`**로 해제하세요.

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { posts } from "../posts";

type Params = { slug: string };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;          // ← 비동기 params 해제
  const post = posts.find((p) => p.slug === slug);
  if (!post) return notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

> 참고: **현재 환경에서 문제가 없다면** 일반(동기) 버전을 사용해도 됩니다.

---

## 4) 개념 정리 — `[slug]`와 데이터 키 매칭
- **slug**는 사람이 읽기 쉬운 **URL 조각**  
- 라우팅 파라미터(`[slug]`)와 **데이터 키**(예: `post.slug`)가 **일치**해야 매칭됨  
  - 예: `/blog/nextjs` → `{ slug: "nextjs" }`를 가진 포스트가 렌더링

---

## 5) 실습 체크리스트 / 트러블슈팅
- **모듈 경로 오류**: 예제에서 `@/lib/...` 같은 별칭이 있으면 **로컬 파일**로 대체(본 문서의 `app/blog/posts.ts`처럼)  
- **개발 서버 캐시**: 라우트/파일 구조 변경 후 **서버 재시작**이 도움이 될 수 있음  
- **`params` Promise 경고**: 위의 **비동기 버전**을 적용  
- **레이아웃 주의**: `layout.tsx`는 **`default export`**와 **`children` 렌더링**이 필수

---

## 6) 참고 스니펫 모음

**새 프로젝트 페이지 예제**
```tsx
// app/page.tsx
export default function Page() {
  return <h1>홈</h1>;
}
```

**서브 페이지 예제**
```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About</h1>;
}
```

**전역 레이아웃 기본형**
```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header>공통 헤더</header>
        <main>{children}</main>
        <footer>공통 푸터</footer>
      </body>
    </html>
  );
}
```

**중첩 레이아웃 예제**
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <aside>대시보드 메뉴</aside>
      <div>{children}</div>
    </section>
  );
}
```

**동적 라우트(일반형)**
```tsx
// app/blog/[slug]/page.tsx
import { posts } from "../posts";

export default function Post({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return <h1>게시글을 찾을 수 없습니다.</h1>;
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 부록: 용어 정리
- **App Router**: `app/` 기반 라우팅 시스템(Next 13+)  
- **`page.tsx`**: 해당 세그먼트의 페이지 컴포넌트(기본 내보내기 필수)  
- **`layout.tsx`**: 하위 경로에 재사용되는 공용 UI  
- **동적 세그먼트**: `[slug]` 형태의 폴더로 URL 변수 매칭  
- **`notFound()`**: 404 처리 헬퍼  
- **`generateStaticParams()`**: 정적 생성 시 **미리** 경로를 제공하여 SSG 최적화

# 3주차

## 0) 용어 정리
- **route(라우트)**: “경로” 그 자체(URL 세그먼트).
- **routing(라우팅)**: 경로를 **찾아 매칭**해 페이지/핸들러를 띄우는 과정.
- **path**: 보통 URL 경로를 의미(문맥상 route와 비슷).

> **디렉터리 vs 폴더**: 의미상 동일. 문서/도구에 따라 혼용됨.

---

## 1) 최상위 폴더 개요
| 폴더 | 의미 |
|---|---|
| `app/` | **App Router** 소스(페이지/레이아웃/라우트) |
| `pages/` | **Pages Router** 소스(레거시/병행 가능) |
| `public/` | 정적 자산(이미지 등). `/` 루트로 서빙 |
| `src/` | 선택. 애플리케이션 코드를 한 곳에 모으는 컨벤션 |

### 자주 보이는 최상위 파일
| 파일 | 용도 |
|---|---|
| `next.config.js` | Next.js 설정 |
| `package.json` | 의존성/스크립트 |
| `instrumentation.ts` | OpenTelemetry/계측 |
| `middleware.ts` | 요청 미들웨어(Edge) |
| `.env*` | 환경 변수 |
| `.eslintrc.json` or `eslint.config.mjs` | ESLint 설정 |
| `next-env.d.ts` | Next TS 타입 선언 |
| `tsconfig.json` / `jsconfig.json` | TS/JS 설정 |

---

## 2) App Router의 라우팅 파일 규칙
| 파일명 | 확장자 | 의미 |
|---|---|---|
| `layout` | js/tsx | 하위 경로 공용 UI(상태/DOM 보존) |
| `page` | js/tsx | 실제 페이지 컴포넌트 |
| `loading` | js/tsx | 서스펜스 로딩 UI |
| `not-found` | js/tsx | 404 UI |
| `error` | js/tsx | 세그먼트 범위 에러 UI |
| `global-error` | js/tsx | 전역 에러 UI |
| `route` | js/ts | API 엔드포인트(HTTP 핸들러) |
| `template` | js/tsx | 다시 렌더되는 레이아웃(상태/DOM 미보존) |
| `default` | js/tsx | 병렬 경로의 폴백 슬롯 UI |

> **중요**: 라우팅 세그먼트로 쓰는 폴더에는 **반드시** `page.tsx`(UI) 또는 `route.ts`(API) 중 하나가 있어야 URL이 매칭됩니다.

---

## 3) 중첩/동적/특수 경로

### 중첩 경로
```
folder           → /folder
folder/sub       → /folder/sub
```

### 동적 경로
- `[id]` : 동적 세그먼트 → `/posts/[id]`
- `[...all]` : **catch-all** → `/docs/a/b/c`
- `[[...all]]` : **optional catch-all**(파라미터 없어도 매칭)

### 경로 그룹 & 프라이빗 폴더
- **경로 그룹**: `(group)` — URL에 **노출되지 않음**
  ```
  app/(marketing)/page.tsx   → URL: /
  ```
- **프라이빗 폴더**: `_name` — import 전용(라우팅 불포함)
  ```
  app/_components/Button.tsx → import 용도로만 사용
  ```

### 병렬 경로(Parallel Routes) & 가로채기(Intercepting)
- **병렬 경로**: `@slot` 폴더
  ```
  app/dashboard/@analytics/page.tsx
  app/dashboard/@feed/page.tsx
  ```
- **가로채기 경로**:
  - `(.)segment`  : 동일 레벨에서 끌어오기
  - `(..)segment` : 한 레벨 위에서
  - `(... )segment`: 루트에서

---

## 4) 메타데이터 파일 규칙

### 앱 아이콘
| 파일 | 확장자 | 설명 |
|---|---|---|
| `favicon` | `.ico` | 파비콘 |
| `icon` | `.ico/.jpg/.jpeg/.png/.svg` | 앱 아이콘 |
| `icon` | `.js/.ts/.tsx` | **생성기 기반** 앱 아이콘 |
| `apple-icon` | `.jpg/.jpeg/.png` | Apple 아이콘 |
| `apple-icon` | `.js/.ts/.tsx` | **생성기 기반** Apple 아이콘 |

### OG/Twitter 이미지
| 파일 | 확장자 | 설명 |
|---|---|---|
| `opengraph-image` | `.jpg/.jpeg/.png/.gif` | OG 이미지 파일 |
| `opengraph-image` | `.js/.ts/.tsx` | **생성기 기반** OG 이미지 |
| `twitter-image` | `.jpg/.jpeg/.png/.gif` | Twitter 카드 이미지 |
| `twitter-image` | `.js/.ts/.tsx` | **생성기 기반** Twitter 이미지 |

### SEO
| 파일 | 확장자 | 설명 |
|---|---|---|
| `sitemap` | `.xml` / `.js/.ts` | 사이트맵 |
| `robots` | `.txt` / `.js/.ts` | 로봇 파일 |

---

## 5) Open Graph(OGP) 기본
링크 공유 시 미리보기 정보를 제공. `<head>`에 메타 태그 선언:
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/page.html" />
<meta property="og:title" content="페이지 제목" />
<meta property="og:description" content="페이지 설명 요약" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:site_name" content="사이트 이름" />
<meta property="og:locale" content="ko_KR" />
```

---

## 6) 구성요소 계층 구조(렌더 트리)
특수 파일이 결합되어 최종 UI가 구성됨:
- `layout.tsx`
- `template.tsx`
- `error.tsx` (React Error Boundary)
- `loading.tsx` (Suspense Fallback)
- `not-found.tsx` (404)
- `page.tsx`

예시(개념):
```tsx
<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary fallback={<NotFound />}>
          <Page />
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  </Template>
</Layout>
```

### 레이아웃 vs 템플릿
| 파일 | 특징 | 상태/DOM 보존 | 사용 사례 |
|---|---|---|---|
| `layout.tsx` | 세그먼트별 공용 UI | **보존됨** | 내비게이션/사이드바/스크롤 |
| `template.tsx` | 재렌더링되는 래퍼 | **보존 안 됨** | 이동 시마다 초기화가 필요한 영역 |

---

## 7) 프로젝트 구성(Colocation & 구조)
- **Colocation**: 기능/페이지 단위로 파일을 폴더에 **함께 배치**해 이해/유지보수 용이.
- `app/`의 각 폴더는 **URL 세그먼트**에 매핑.
- 같은 세그먼트라도 **페이지(`page.tsx`)** 또는 **API(`route.ts`)**가 있어야 실제 라우트가 형성됨.

### 관례적 폴더
- 자주 쓰는 이름: `components/`, `lib/`, `utils/`, `hooks/`, `styles/` 등  
  (프레임워크가 특별 취급하진 않지만 팀 컨벤션으로 사용)

---

## 8) 프로젝트 생성 & 실행

### 생성
```bash
npx create-next-app@latest
# 보통 다음을 권장:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind: 필요 시 Yes
# - src/: Yes(권장)
# - App Router: Yes
# - import alias(@/*): Yes
```

### 실행
```bash
npm run dev
```
- 실행 시 `.next/` 폴더가 생성(빌드 산출물/중간 성물 보관).
- 내부적으로 `next dev`, `next build`, `next start`가 활용.

### `src/` 사용 여부
- **사용(권장)**: 대규모/중규모 프로젝트. 코드/문서 경계가 깔끔.
  - 예: `src/app`, `src/components`, `src/lib`
- **미사용**: 소규모/학습 프로젝트에서 단순화.

---

## 9) ESLint 설정 파일 선택
| 파일 | 특징 |
|---|---|
| `.eslintrc.json` | JSON 기반, 정적 구성, 구버전 호환 좋음 |
| `eslint.config.mjs` | ESM 기반, 동적/모듈화 유연, **ESLint v9+ 권장** |

---

## 10) 로딩 상태/UI 스켈레톤
- 특정 세그먼트 폴더에 `loading.tsx`를 두면 **해당 라우트 범위에서만** 로딩 UI가 동작.
  - 예: `app/dashboard/(overview)/loading.tsx` → `/dashboard` 하위 중 `(overview)` 범위에만 적용
- **스켈레톤 로딩**: 실제 콘텐츠가 오기 전 **자리표시자(회색 박스, 텍스트 블록 등)**를 보여 체감 속도를 향상.

간단 예시:
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ width: 280, height: 24, opacity: 0.2, background: '#ccc' }} />
      <div style={{ width: 480, height: 12, marginTop: 8, opacity: 0.2, background: '#ccc' }} />
      <div style={{ width: 480, height: 12, marginTop: 6, opacity: 0.2, background: '#ccc' }} />
    </div>
  );
}
```

---

## 11) 실무 팁 요약
- 라우팅 세그먼트별로 **`layout.tsx` vs `template.tsx`**의 특성을 구분해 사용.
- URL 구조 변경/폴더 이동 후 라우팅이 꼬이면 **개발 서버 재기동**을 고려.
- `(group)`, `_private`, `@slot`, `(.)/(..)/(... )` 가로채기 규칙을 알면 복잡한 레이아웃/데이터 흐름을 깔끔히 설계 가능.


# 2주차

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

