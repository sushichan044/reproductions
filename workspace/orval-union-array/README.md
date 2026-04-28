# orval-union-array

Reproduction for: **Array items using `allOf` generate `A & B[]` instead of `(A & B)[]`**

## Bug

When an OpenAPI array item uses `allOf` to combine multiple `$ref`s, Orval generates the intersection type without parentheses.

**OpenAPI schema:**

```yaml
type: array
items:
  allOf:
    - $ref: "#/components/schemas/UnionPartOne"
    - $ref: "#/components/schemas/UnionPartTwo"
```

**Generated (incorrect):**

```ts
data: UnionPartOne & UnionPartTwo[]
// TypeScript parses this as: UnionPartOne & (UnionPartTwo[])
```

**Expected:**

```ts
data: (UnionPartOne & UnionPartTwo)[]
```

## Why `tsc` does not catch this

The generated `fetch` client only declares the response type — it never assigns an array literal to it.
TypeScript checks the _definition_ for syntax, not semantic correctness against the spec intent.
The error would surface as soon as any code tries to assign an actual `(UnionPartOne & UnionPartTwo)[]` value to the type.

## Steps to reproduce

```bash
pnpm install
pnpm generate   # runs orval
pnpm typecheck  # tsc — exits 0, but generated type is semantically wrong
```

Check `generated/repro.ts` line 17:

```ts
data: UnionPartOne & UnionPartTwo[];
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ should be (UnionPartOne & UnionPartTwo)[]
```
