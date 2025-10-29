# 10주차
## 개요

# 🧠 Next.js `"use client"` 완벽 정리

Next.js의 **Server Components / Client Components** 개념에서  
`"use client"` 지시문은 **클라이언트 전용 컴포넌트임을 명시**하는 역할을 합니다.  

이 문서는 `"use client"`의 **사용 예시**, **데이터 전달 방식**, **성능 최적화 방법** 등을 다룹니다.

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

---

##  JS 번들 크기 줄이기

> `"use client"`는 **최소한의 영역에만 적용하는 것이 좋습니다.**  
> 상위 레이아웃 전체에 적용하면 불필요하게 JS 번들이 커집니다.

### ✅ 예시

```tsx
// app/layout.tsx
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

```tsx
// app/ui/search.tsx
'use client'

export default function Search() {
  // ...
}
```

 이렇게 하면 정적인 부분은 **서버에서 처리**,  
상호작용이 필요한 `Search`만 **클라이언트에서 동작**합니다.

---

##  서버 → 클라이언트 데이터 전달

Server Component에서 데이터를 불러오고  
Client Component로 **props를 통해 전달**할 수 있습니다.

```tsx
// app/[id]/page.tsx
import LikeButton from '@/app/ui/like-button'
import { getPost } from '@/lib/data'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  return <LikeButton likes={post.likes} />
}
```

```tsx
// app/ui/like-button.tsx
'use client'

export default function LikeButton({ likes }: { likes: number }) {
  // ...
}
```

 **주의:**  
Client Component로 전달되는 props는 반드시 **직렬화 가능(Serializable)** 해야 합니다.

---

##  Server ↔ Client 컴포넌트 섞기 (Interleaving)

Server Component를 Client Component의 **children**으로 넘길 수 있습니다.

###  예시

```tsx
// app/ui/modal.tsx
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

```tsx
// app/page.tsx
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

➡️ 서버 렌더링된 UI를 **클라이언트 상태를 가진 컴포넌트 안에 자연스럽게 포함**할 수 있습니다.

---

##  React Context 사용하기

>  **주의:**  
> React의 Context API는 **Server Component에서 직접 지원되지 않습니다.**  
> 따라서 **Client Component Provider**를 만들어 사용해야 합니다.

```tsx
// app/theme-provider.tsx
'use client'

import { createContext } from 'react'

export const ThemeContext = createContext({})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
}
```

```tsx
// app/layout.tsx
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

 **팁:**  
Provider는 가능한 한 **트리의 깊은 곳에 위치시켜야**  
Next.js가 **정적 부분을 최적화하기 쉽습니다.**

---

##  써드파티(Third-party) 컴포넌트 사용

클라이언트 전용 기능(`useState`, `useEffect`)을 사용하는  
서드파티 컴포넌트는 반드시 **Client Component**에서만 사용해야 합니다.

###  예시

```tsx
// app/gallery.tsx
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

 **주의:**  
`Server Component`에서 직접 사용하면 오류가 발생합니다.  

 **해결:**  
서드파티 컴포넌트를 **Client Wrapper**로 감싸서 사용합니다.

```tsx
// app/carousel.tsx
'use client'

import { Carousel } from 'acme-carousel'
export default Carousel
```

이제 Server Component에서도 정상적으로 사용할 수 있습니다 👇

```tsx
// app/page.tsx
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

---

##  라이브러리 제작자를 위한 조언

- 라이브러리에서 **클라이언트 전용 기능**(`useState`, `useEffect`)을 사용하는 엔트리 포인트에는  
  반드시 `"use client"`를 추가하세요.
- 이렇게 하면 사용자가 따로 래퍼를 만들 필요 없이 바로 import 가능합니다.
-  일부 번들러(`esbuild`, `rollup`)는 `"use client"`를 제거할 수 있으므로  
  **빌드 설정에서 보존하도록 명시해야 합니다.**

---

##  요약

| 구분 | 설명 |
|------|------|
| `"use client"` | 파일을 클라이언트 컴포넌트로 선언 |
| 데이터 전달 | Server → Client는 `props`로 전달 (직렬화 필요) |
| 번들 최적화 | 최소한의 컴포넌트만 Client로 지정 |
| Context | Client Provider를 만들어 Server에서 감싸기 |
| 써드파티 | Client에서만 사용하거나 Wrapper로 감싸기 |
| 라이브러리 | `"use client"` 지시문을 엔트리포인트에 명시 |

---

>  **정리 한 줄 요약**  
> `"use client"`는 Next.js의 **서버-클라이언트 경계**를 명시하는 핵심 도구입니다.  
> 정적인 부분은 **서버에서 처리**,  
> 상호작용이 필요한 부분만 **클라이언트에서 실행**하면  
> **성능과 유지보수성 모두 향상**됩니다.



# 9주차
# Next.js Server 및 Client Component 인터리빙 (Interleaving) & Context 정리

## 1. Server 및 Client Component 인터리빙 (Interleaving)

### 개념
- **인터리빙(Interleaving)**은 서버 컴포넌트와 클라이언트 컴포넌트가 하나의 렌더링 트리 안에서 함께 작동하는 구조를 의미한다.
- 서버에서 렌더링된 UI와 클라이언트 상호작용 UI가 섞여서 동작한다.

### 작동 방식 요약
- Server Component → Client Component로 **props 전달 가능**  
  서버에서 처리된 데이터를 클라이언트 컴포넌트로 전달할 수 있다.
- Client Component 내부에서 **Server UI를 중첩 가능**
  - 예: 서버에서 렌더링된 콘텐츠를 클라이언트 상호작용 영역에 삽입 가능.
- 일반적으로 `<ClientComponent>`의 `children`을 통해 서버 컴포넌트를 전달한다.

### 예시 코드
```tsx
// app/ui/modal.tsx
'use client';

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

`Modal`은 클라이언트 컴포넌트이지만 내부의 `children`에는 서버에서 렌더링된 요소를 전달할 수 있다.  
이렇게 서버와 클라이언트 렌더링이 하나의 구조로 결합되는 것이 **Interleaving**이다.

### 개념 정리
- 서버 컴포넌트와 클라이언트 컴포넌트가 섞여서 작동하는 구조.
- 데이터 전달과 렌더링을 효율적으로 분리하고 조합 가능.

### 예시
클라이언트의 상태(`state`)로 표시 여부를 제어하는 `<Modal>` 안에,  
서버에서 데이터를 가져오는 `<Cart>` 컴포넌트를 포함할 수 있다.

```tsx
// app/page.tsx
import Modal from "./ui/modal";
import Cart from "./ui/cart";

export default function Page() {
  return (
    <Modal>
      <Cart />
    </Modal>
  );
}
```

- `Page`: Server Component  
- `Modal`: Client Component  
- `Cart`: Server Component

서버에서 렌더링된 `<Cart>`의 HTML이 클라이언트 측 `<Modal>`의 `children`으로 전달되어  
트리 내에서 섞여(interleaved) 작동한다.

### 작동 방식 요약
1. Next.js는 **Server Component를 먼저 렌더링**하여 HTML로 변환한다.
2. 이 HTML을 **Client Component의 `{children}` 위치에 삽입**한다.
3. 클라이언트는 해당 부분에 **Hydration(이벤트 연결)**을 수행한다.
4. 서버 데이터는 이미 포함되어 있고, 버튼 등 상호작용만 클라이언트에서 처리된다.

즉, **서버와 클라이언트가 섞여(interleaved) 작동하는 구조**이다.

---

## 2. Context란 무엇인가?

### 기본 개념
- React 및 Next.js에서 **Context**는 컴포넌트 간 데이터를 공유하기 위한 메커니즘이다.
- 부모가 자식에게 직접 props를 전달하지 않아도, 하위 트리 전체에서 공통 데이터를 접근할 수 있다.

### 동작 개요
1. `React.createContext()`로 Context 객체를 생성한다.
2. `MyContext.Provider`를 사용해 하위 컴포넌트에 값을 전달한다.
3. 하위 컴포넌트는 `useContext(MyContext)`로 해당 값을 읽는다.

### 코드 예시
```tsx
// Context 생성
const MyContext = React.createContext();

function MyComponent() {
  const value = useContext(MyContext);
  return <div>{value}</div>;
}

function App() {
  return (
    <MyContext.Provider value="Hello from Context">
      <MyComponent />
    </MyContext.Provider>
  );
}
```

### 작동 원리 요약
- `App`은 `MyContext.Provider`를 통해 데이터를 하위 트리로 전달한다.
- `MyComponent`는 `useContext(MyContext)`로 `"Hello from Context"` 값을 읽는다.
- props를 사용하지 않고도 데이터 공유가 가능하다.

### 정리 포인트

| 구분 | 설명 |
|------|------|
| **Provider** | Context 값을 하위 컴포넌트에 전달 |
| **Consumer (useContext)** | Context 값을 읽고 사용 |
| **장점** | props drilling 없이 전역 상태 공유 가능 |
| **활용 예시** | 로그인 사용자 정보, 테마 색상, 다국어 설정 등 |

---

## 핵심 정리

- **Interleaving**: Server와 Client가 하나의 트리 안에서 섞여 렌더링되는 구조.  
  서버 데이터는 HTML로 포함되고, 클라이언트는 상호작용만 담당.
- **Context**: React의 전역 데이터 전달 시스템.  
  props 없이도 하위 컴포넌트들이 공통 데이터를 공유할 수 있다.


# 8주차
# Next.js Server 및 Client Component 사용 시점 정리

## 1. Server 및 Client Component를 언제 사용해야 하나?

### 개요
Client 환경과 Server 환경은 서로 다른 기능을 수행한다.  
각 환경에서 필요한 로직을 적절히 분리하면 성능과 보안 모두 향상된다.

---

### Client Component를 사용해야 하는 경우

| 필요 항목 | 설명 |
|------------|------|
| **state 및 event handler** | `onClick`, `onChange` 등 사용자 이벤트 처리 |
| **Lifecycle logic** | `useEffect` 등 컴포넌트 생명주기 로직 사용 |
| **브라우저 전용 API** | `localStorage`, `window`, `navigator.geolocation` 등 |
| **사용자 정의 Hook** | 클라이언트 상태나 상호작용을 다루는 커스텀 훅 |

---

### Server Component를 사용해야 하는 경우

| 필요 항목 | 설명 |
|------------|------|
| **데이터 Fetching** | 서버 DB나 API에서 데이터를 가져올 때 |
| **보안 데이터 처리** | API key, 인증 정보 등 민감한 데이터 보호 |
| **JS 번들 최소화** | 브라우저에 전달되는 JavaScript 용량 감소 |
| **렌더링 성능 향상** | Server → Client 스트리밍으로 초기 렌더링(FCP) 개선 |

---

### 요약
- **Client Component**: 상호작용 중심 (이벤트, 상태, 브라우저 API)
- **Server Component**: 데이터 중심 (DB, API, 보안, 초기 렌더링)

---

## 2. 실습 예제

`<Page>` 컴포넌트는 서버에서 게시물 데이터를 가져오고,  
`<LikeButton>`은 클라이언트에서 상호작용을 처리한다.

```tsx
// app/[id]/page.tsx
import LikeButton from "@/app/ui/like-button";
import { getPost } from "@/lib/data";

export default async function Page({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  return (
    <main>
      <h1>{post.title}</h1>
      <LikeButton likes={post.likes} />
    </main>
  );
}
```

```tsx
// app/ui/like-button.tsx
"use client";

import { useState } from "react";

export default function LikeButton({ likes }: { likes: number }) {
  const [count, setCount] = useState(likes);
  return (
    <button onClick={() => setCount(count + 1)}>
      ❤️ {count} likes
    </button>
  );
}
```

---

## 3. Slug Page 완성 예제

`getPost` 함수를 별도로 만들지 않고, `id`로 직접 비교하여 데이터를 가져오는 방식이다.

```tsx
// app/[id]/page.tsx
import LikeButton from "@/app/ui/like-button";
import { posts } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = posts.find((p) => p.id === id);

  if (!post) return notFound();

  return (
    <main>
      <h1>{post.title}</h1>
      <LikeButton likes={post.likes} />
    </main>
  );
}
```

> `notFound()`는 Next.js 내장 함수로, 존재하지 않는 페이지 접근 시 404 페이지를 렌더링한다.

---

## 4. Optimistic Update (낙관적 업데이트)

### 개념
사용자 이벤트 발생 시, **서버 응답을 기다리지 않고 UI를 즉시 업데이트**한다.  
성공을 낙관적으로 가정하고 화면을 먼저 변경한다.

| 항목 | 설명 |
|------|------|
| **장점** | 빠른 반응성, 즉각적인 피드백 제공 |
| **단점** | 서버 오류 시 잘못된 정보가 잠시 표시될 수 있음 (rollback 필요) |

**핵심 목적:** 네트워크 지연 중에도 즉각적인 반응성을 제공한다.

---

## 5. Pessimistic Update (비관적 업데이트)

### 개념
서버 요청이 완료된 후에만 UI를 업데이트한다.  
데이터의 정확성이 중요한 경우 사용된다.

| 항목 | 설명 |
|------|------|
| **장점** | 데이터의 정확성과 신뢰성 보장 |
| **단점** | 서버 응답 지연 시 UX 저하 |

---

### 비교 요약

| 구분 | 낙관적 업데이트 | 비관적 업데이트 |
|------|----------------|----------------|
| **UI 업데이트 시점** | 요청 직후 즉시 | 서버 응답 후 |
| **응답 실패 시** | 원래 상태로 롤백 | UI 변화 없음 |
| **장점** | 빠른 반응성, 즉각 피드백 | 일관성, 정확성 보장 |
| **대표 예시** | 좋아요 버튼 클릭 | 데이터 수정, 폼 제출 |

---

## 6. like-button.tsx 구성

`/ui/like-button.tsx`에서는 **두 개의 상태(state)** 를 사용한다.

```tsx
const [count, setCount] = useState<number>(likes ?? 0);
const [isLiking, setIsLiking] = useState(false);
```

| 상태 | 역할 |
|------|------|
| `count` | 좋아요 클릭 횟수 저장 (초기값: `likes`) |
| `isLiking` | 서버 요청 중 여부 표시 (중복 클릭 방지 및 로딩 상태 표시) |

### isLiking의 주요 역할
- 중복 클릭 방지 (`isLiking === true`일 때 버튼 비활성화)
- 로딩 상태 UI 표시 (스피너 등)
- 요청 완료 전 상태 변경 방지로 **상태 안정성 보장**

---

## 7. Null 병합 연산자 (??)

```tsx
const [count, setCount] = useState<number>(likes ?? 0);
```

### 설명
- `??` 연산자는 **왼쪽 피연산자가 null 또는 undefined일 경우 오른쪽 값을 반환**한다.
- `likes`가 null 또는 undefined면 0을 사용하고, 값이 있으면 그대로 사용한다.

### OR(||)와의 차이점
| 연산자 | 동작 방식 |
|---------|------------|
| `||` | falsy 값 전체(`false`, `0`, `""`, `null`, `undefined`)를 오른쪽 값으로 대체 |
| `??` | null, undefined만 대체 (0은 유효한 값으로 유지) |

✅ 결론: `likes ?? 0`은 좋아요 수가 null일 때만 0으로 초기화된다.

---

## 8. Next.js에서 Server와 Client Component의 작동

### Client Component의 첫 로드 과정

1. **HTML 렌더링**
   - 사용자가 페이지를 요청하면 서버가 생성한 **정적 HTML 미리보기**를 먼저 표시한다.
   - 초기 로드시 빠른 첫 화면(FCP)을 제공한다.

2. **RSC(Rendering Server Component) 로드**
   - 서버와 클라이언트 컴포넌트 트리를 조정하여 데이터와 UI를 동기화한다.

3. **JavaScript Hydration**
   - 클라이언트 컴포넌트는 정적 HTML을 **인터랙티브(대화형)** React 앱으로 변환한다.

---

### Hydration이란?
- 서버에서 전달된 **정적 HTML에 이벤트 핸들러(onClick 등)** 를 연결하는 과정이다.
- DOM을 React가 제어 가능한 상태로 바꿔서, **사용자 상호작용이 가능한 앱으로 활성화**한다.

즉, **Hydration = HTML + 이벤트 연결 → React 앱으로 변환** 과정이다.

---

## 핵심 요약

| 구분 | 설명 |
|------|------|
| **Client Component** | 상호작용, 이벤트 처리, 브라우저 API 사용 |
| **Server Component** | 데이터 Fetch, 보안 로직, 초기 렌더링 |
| **Optimistic Update** | 즉시 UI 변경, 빠른 반응성, rollback 필요 |
| **Pessimistic Update** | 서버 응답 후 변경, 일관성 중심 |
| **Hydration** | 서버 HTML을 대화형 React로 변환 |


# 7주차
-시험

# 6주차
# Next.js Client-side Transitions 및 네비게이션 작동 방식 정리

## 1. Client-side Transitions (클라이언트 측 전환)

### 개념
일반적으로 서버 렌더링 페이지로 이동하면 전체 페이지가 새로 로드되어  
state 초기화, 스크롤 위치 리셋, 상호작용 차단 등의 문제가 발생한다.

Next.js는 `<Link>` 컴포넌트를 활용한 **클라이언트 측 전환(Client-side transition)** 으로 이러한 문제를 해결한다.  
페이지를 다시 로드하지 않고 **콘텐츠만 동적으로 갱신**한다.

### 주요 특징
- **공유 레이아웃 및 UI 유지**
- **Prefetching(미리 가져오기)** 을 통해 다음 페이지 로드를 빠르게 수행
- **서버 렌더링 앱을 클라이언트 렌더링 앱처럼 부드럽게 전환**

Prefetching과 스트리밍을 결합하면 동적 경로 전환도 빠르게 처리 가능하다.

---

## 1절. 네비게이션 작동 방식 실습

### 디렉토리 구조 예시
```
app/
 ├─ page.tsx        // Root Page
 ├─ layout.tsx      // Root Layout
 └─ blog/
     ├─ page.tsx    // 블로그 목록
     └─ loading.tsx // 로딩 스켈레톤
```

### 실습 순서
1. Root Page 작성  
2. `blog` 디렉토리에 `page.tsx` 및 `loading.tsx` 추가  
3. `RootLayout`에서 `<Link>`로 블로그 네비게이션 구현

> 참고: `blog/page`에서 `time delay`를 추가하면 로딩 스켈레톤 동작을 확인할 수 있다.

---

### 오류 예시
RootLayout에서 `<a>` 태그를 직접 사용하면 다음과 같은 오류가 발생한다.

```
Do not use an `<a>` element to navigate to `/blog/`. 
Use `<Link />` from `next/link` instead.
```

### 권장 규칙
| 이동 대상 | 권장 방법 |
|------------|------------|
| **내부 페이지 이동** | `<Link>` 사용 ✅ |
| **외부 링크 이동** | `<a>` 태그 사용 (필요 시 `target` 속성 추가) |

즉, **Next.js 내부 라우팅은 반드시 `<Link>`를 사용해야 한다.**

---

## 2. 전환 속도를 느리게 만드는 요인과 해결 방법

Next.js는 최적화를 통해 빠르고 부드러운 네비게이션을 제공하지만,  
특정 조건에서는 전환 속도가 느려질 수 있다.

### 2-1. 동적 경로에 `loading.tsx`가 없는 경우

동적 경로 이동 시, 클라이언트는 서버 응답을 기다려야 렌더링 가능하다.  
→ 사용자는 앱이 멈춘 것처럼 느낄 수 있다.

#### 개선 방법
- **부분 프리패칭 활성화**
- **로딩 UI 제공을 위한 `loading.tsx` 추가**

```tsx
// app/blog/[slug]/loading.tsx
export default function Loading() {
  return <LoadingSkeleton />;
}
```

#### 개발자 도구 활용
- **Next.js Devtools** → 페이지가 정적인지/동적인지 확인 가능  
- **devIndicators 설정**으로 화면 하단에 빌드 상태 표시 가능

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-left" },
};

export default nextConfig;
```

보통 화면 좌측 하단에 `N` 아이콘이 표시되며, 위치는 설정에서 변경 가능하다.  
현재는 라우팅 결과 정도만 표시한다.

---

### 2-2. 동적 세그먼트에서 `generateStaticParams`가 없는 경우

동적 세그먼트는 **사전 렌더링(Static Generation)** 이 가능하다.  
하지만 `generateStaticParams`가 누락되면 해당 경로는 동적으로 렌더링된다.

#### 해결 방법
`generateStaticParams`를 추가하여 빌드 시점에 정적 경로를 생성한다.

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("../posts").then((res) => res.json());

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}
```

---

### 2-3. `generateStaticParams` 실습 및 코드 분석

`generateStaticParams`를 사용하면 빌드 시점에 정적 HTML을 미리 생성한다.  
사용하지 않으면 매 요청 시 서버에서 동적으로 처리한다.

#### 요약
| 상황 | 설명 |
|------|------|
| **사용 시** | 정적 페이지 생성 → 빠른 로드 속도 |
| **미사용 시** | 요청마다 동적 렌더링 → 서버 부하 증가 |

> 자주 변하지 않는 페이지 → `generateStaticParams` 사용 권장  
> 실시간 데이터가 필요한 경우 → 동적 렌더링 유지

---

### 코드 예시 (generateStaticParams 미사용)

```tsx
// app/blog2/[slug]/page.tsx
import { posts } from "../posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return <h1>포스트를 찾을 수 없습니다.</h1>;
    // 실제 프로젝트에서는 notFound() 사용 권장
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

#### 특징
- `params`는 런타임에만 해석 가능 (정적 빌드 시점에는 알 수 없음)
- `generateStaticParams` 미사용 시 페이지 접근마다 동적 처리 수행
- 실습 시 `notFound()` 같은 Next.js 내장 핸들러를 사용하는 것이 권장됨

---

## 3. async 함수 사용 이유

Next.js 13+의 App Router 구조에서 `page.tsx`는 **Server Component**이므로  
비동기 렌더링이 기본적으로 지원된다.

### async를 사용하는 이유
1. **일관성 유지** – 모든 페이지에서 async를 사용하면 코드 스타일이 통일됨  
2. **확장성 확보** – 이후 fetch, DB 연동 등을 추가해도 수정 불필요  
3. **Server Component 호환성** – Promise 반환이 가능한 구조로 최적화되어 있음

즉, async는 **현재와 미래 모두를 고려한 안전한 선택**이다.

---

## 핵심 요약

| 구분 | 설명 |
|------|------|
| **Client-side Transition** | 페이지를 새로고침 없이 부드럽게 전환 |
| **Link 컴포넌트** | 내부 라우팅 전용, Prefetch로 속도 향상 |
| **loading.tsx** | 동적 경로 로딩 시 사용자 피드백 제공 |
| **generateStaticParams** | 정적 페이지 미리 생성하여 빠른 로딩 |
| **async 함수** | Server Component에서 비동기 렌더링 지원 |



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

