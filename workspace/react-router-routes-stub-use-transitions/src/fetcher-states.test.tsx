import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { startTransition, useEffect } from "react";
import { createMemoryRouter, createRoutesStub, useFetcher } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, describe, expect, it } from "vitest";

// Needed so React treats `act` as available outside of a test framework hook.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function action() {
  await sleep(50);
  return { ok: false };
}

function Probe({ onState }: { onState: (state: string) => void }) {
  const fetcher = useFetcher();

  useEffect(() => {
    onState(fetcher.state);
  }, [fetcher.state, onState]);

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => fetcher.submit({}, { method: "post", action: "/act" }));
      }}
    >
      SubmitButton
    </button>
  );
}

/** Clicks the button and returns every `fetcher.state` the component committed. */
async function clickAndRecord(renderApp: (onState: (state: string) => void) => void) {
  const states: string[] = [];
  const onState = (state: string) => {
    // Collapse repeated commits of the same state.
    if (states.at(-1) !== state) states.push(state);
  };

  renderApp(onState);

  fireEvent.click(screen.getByText("SubmitButton"));
  // Advance in small steps so intermediate commits are not batched away.
  for (let i = 0; i < 30; i++) {
    await act(async () => {
      await sleep(10);
    });
  }

  return states;
}

function renderWithRouterProvider(onState: (state: string) => void, useTransitions?: boolean) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <Probe onState={onState} /> },
      { path: "/act", action },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} useTransitions={useTransitions} />);
}

function renderWithRoutesStub(onState: (state: string) => void) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <Probe onState={onState} /> },
    { path: "/act", action },
  ]);
  render(<Stub initialEntries={["/"]} />);
}

describe("fetcher.submit wrapped in startTransition", () => {
  it("commits `submitting` with <RouterProvider useTransitions>", async () => {
    const states = await clickAndRecord((onState) => renderWithRouterProvider(onState, true));

    expect(states).toEqual(["idle", "submitting", "loading", "idle"]);
  });

  it("does not commit `submitting` with <RouterProvider> without useTransitions", async () => {
    const states = await clickAndRecord((onState) => renderWithRouterProvider(onState));

    expect(states).toEqual(["idle"]);
  });

  // `createRoutesStub` has no way to pass `useTransitions`, so it behaves like the
  // case above. `it.fails` passes while the assertion below fails. When the stub
  // gains the prop, this test starts "failing" and should become a plain `it`.
  it.fails("commits `submitting` with createRoutesStub (missing capability)", async () => {
    const states = await clickAndRecord(renderWithRoutesStub);

    expect(states).toEqual(["idle", "submitting", "loading", "idle"]);
  });

  it("ignores a `useTransitions` prop passed to the createRoutesStub component", async () => {
    const states = await clickAndRecord((onState) => {
      const Stub = createRoutesStub([
        { path: "/", Component: () => <Probe onState={onState} /> },
        { path: "/act", action },
      ]);
      // @ts-expect-error `useTransitions` does not exist on `RoutesTestStubProps`.
      render(<Stub initialEntries={["/"]} useTransitions />);
    });

    expect(states).toEqual(["idle"]);
  });
});
