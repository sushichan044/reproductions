import type { Simplify } from "type-fest";
import { assertType, expectTypeOf, test } from "vitest";

import type { getOptionsResponse200, UnionPartOne, UnionPartTwo } from "./generated/repro.js";

type Expected = Array<Simplify<UnionPartOne & UnionPartTwo>>;

type Actual = Simplify<getOptionsResponse200["data"]>;

test("types work properly", () => {
  expectTypeOf<Expected>().toEqualTypeOf<Actual>();
});
