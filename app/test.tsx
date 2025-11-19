import { Suspense } from "react"

export default function test() {
    const posts = fetch('httls://')
    .then((res) => res.json)

    return (
        <Suspense fallback={<div></div>}

    )
}