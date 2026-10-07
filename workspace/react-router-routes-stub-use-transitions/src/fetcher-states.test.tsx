import { startTransition, useEffect, useState } from "react";
import { createMemoryRouter, createRoutesStub, useFetcher } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const FULL_SEQUENCE = "idle,submitting,loading,idle";

async function action() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { ok: false };
}

function Probe() {
  const fetcher = useFetcher();
  const [states, setStates] = useState<string[]>([]);

  // Record every `fetcher.state` this component commits.
  useEffect(() => {
    setStates((prev) => (prev.at(-1) === fetcher.state ? prev : [...prev, fetcher.state]));
  }, [fetcher.state]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          startTransition(() => fetcher.submit({}, { method: "post", action: "/act" }));
        }}
      >
        SubmitButton
      </button>
      <output data-testid="states">{states.join(",")}</output>
      <output data-testid="data">{JSON.stringify(fetcher.data ?? null)}</output>
    </>
  );
}

const routes = [
  { path: "/", Component: Probe },
  { path: "/act", action },
];

function renderWithRouterProvider(useTransitions?: boolean) {
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  return render(<RouterProvider router={router} useTransitions={useTransitions} />);
}

/** Clicks the button, waits for the action result, and returns the recorded states element. */
async function submitAndWait() {
  await page.getByRole("button", { name: "SubmitButton" }).click();
  await expect.element(page.getByTestId("data")).toHaveTextContent('{"ok":false}');
  return page.getByTestId("states");
}

describe("fetcher.submit wrapped in startTransition", () => {
  it("commits `submitting` with <RouterProvider useTransitions>", async () => {
    await renderWithRouterProvider(true);

    await expect.element(await submitAndWait()).toHaveTextContent(FULL_SEQUENCE);
  });

  it("does not commit `submitting` with <RouterProvider> without useTransitions", async () => {
    await renderWithRouterProvider();

    await expect.element(await submitAndWait()).toHaveTextContent(/^idle$/);
  });

  // `createRoutesStub` has no way to pass `useTransitions`, so it behaves like the
  // case above. `it.fails` passes while the assertion below fails. When the stub
  // gains the prop, this test starts "failing" and should become a plain `it`.
  it.fails("commits `submitting` with createRoutesStub (missing capability)", async () => {
    const Stub = createRoutesStub(routes);
    await render(<Stub initialEntries={["/"]} />);

    const states = await submitAndWait();

    // A short poll timeout keeps this expected failure from waiting for the 15s default.
    await expect.poll(() => states.element().textContent, { timeout: 1000 }).toBe(FULL_SEQUENCE);
  });

  it("ignores a `useTransitions` prop passed to the createRoutesStub component", async () => {
    const Stub = createRoutesStub(routes);
    // @ts-expect-error `useTransitions` does not exist on `RoutesTestStubProps`.
    await render(<Stub initialEntries={["/"]} useTransitions />);

    await expect.element(await submitAndWait()).toHaveTextContent(/^idle$/);
  });
});
