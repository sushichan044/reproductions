import type { Simplify } from "type-fest";
import { assertType, expectTypeOf, test } from "vitest";

import type { getOptionsResponse200, UnionPartOne, UnionPartTwo } from "./generated/repro.js";

type Expected = Array<UnionPartOne & UnionPartTwo>;

type Actual = getOptionsResponse200["data"];

test("types work properly", () => {
  type ExpectedShape = Simplify<Expected>;
  //     ^?
  type ActualShape = Simplify<Actual>;
  //     ^?

  expectTypeOf<Expected>().toEqualTypeOf<Actual>();
});
