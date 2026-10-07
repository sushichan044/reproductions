# react-router-routes-stub-use-transitions

Reproduction for: **`createRoutesStub` cannot enable `useTransitions`, so components tested with it behave differently from the real app**

## Versions

- `react-router` 8.4.0
- `react` / `react-dom` 19.3.0
- `vitest` 4.1.11 in browser mode (`@vitest/browser-playwright` 4.1.11, `playwright` 1.63.0, headless Chromium) with `vitest-browser-react` 2.3.0

## How to reproduce

```bash
git clone https://github.com/sushichan044/reproductions.git
cd reproductions
pnpm install
cd workspace/react-router-routes-stub-use-transitions
pnpm exec playwright install chromium  # one-time browser download
pnpm test       # vitest browser mode
pnpm typecheck  # tsc
```

## Scenario

`Probe` renders a `SubmitButton`. Clicking it calls `startTransition(() => fetcher.submit({}, { method: "post", action: "/act" }))`.
The `/act` action resolves after 50ms with `{ ok: false }`.
A `useEffect` records every `fetcher.state` the component commits and renders the list in an `<output data-testid="states">` element, which the tests assert on in a real browser.

## Expected behavior

With `useTransitions` enabled, React Router exposes `fetcher.state` through `React.useOptimistic`, so the transition shows the intermediate states:
`idle -> submitting -> loading -> idle`
(see https://reactrouter.com/explanation/react-transitions).
`createRoutesStub` should let tests opt in to the same behavior as `<RouterProvider>`, `<HydratedRouter>` and `<MemoryRouter>`.

## Actual behavior

| Setup                                               | Recorded `fetcher.state` sequence |
| --------------------------------------------------- | --------------------------------- |
| `<RouterProvider router={router} useTransitions />` | `idle, submitting, loading, idle` |
| `<RouterProvider router={router} />`                | `idle`                            |
| `createRoutesStub([...])` (no way to opt in)        | `idle`                            |

`src/fetcher-states.test.tsx` contains four tests:

1. `RouterProvider useTransitions` commits `submitting`. Passes.
2. `RouterProvider` without `useTransitions` never commits `submitting`. Passes.
3. `createRoutesStub` is expected to commit `submitting`. It is written with `it.fails`, so it is reported as "expected fail". This is the missing capability. When the stub supports `useTransitions`, this test starts failing and should become a plain `it`.
4. Passing `useTransitions` to the component returned by `createRoutesStub` is a TypeScript error (`@ts-expect-error`, checked by `pnpm typecheck`) and is ignored at runtime. Passes.

Expected `pnpm test` summary: `3 passed | 1 expected fail (4)`.

## Explanation

`createRoutesStub` renders `<RouterProvider router={...} />` internally and does not accept or forward `useTransitions`.
Without it, React Router applies state updates directly instead of through `React.useOptimistic`.
Inside an async `startTransition`, those updates are not rendered until the transition finishes, so `submitting` is never committed.
Code that wraps `fetcher.submit` or `navigate` in `startTransition` therefore sees different intermediate states in a test using `createRoutesStub` than in an app that enables `useTransitions`, and the test cannot be configured to match.

## Suggested fix

In `packages/react-router/lib/dom/ssr/routes-test-stub.tsx`, add `useTransitions?: boolean` to `RoutesTestStubProps` and pass it through:

```tsx
<RouterProvider router={routerRef.current} useTransitions={useTransitions} />
```
