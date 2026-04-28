import { assertType, expectTypeOf, test } from "vitest";

import type { getOptionsResponse200, UnionPartOne, UnionPartTwo } from "./generated/repro.js";

type Expected = Array<UnionPartOne & UnionPartTwo>;

type Actual = getOptionsResponse200["data"];

test("types work properly", () => {
  expectTypeOf<Expected>().toEqualTypeOf<Actual>();
});
