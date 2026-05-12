# astro-7-node-adapter-11

## How to reproduce

1. Clone the repository and navigate to the `astro-7-node-adapter-11` directory.

2. Install dependencies using `pnpm install`.

3. Build the project using `pnpm build`.

4. Preview the project using `pnpm preview`.

## Expected behavior

The preview server should start without any errors.

## Actual behavior

```bash
$ astro preview

01:16:23 [@astrojs/node] Enabling sessions with filesystem storage
app.getAdapterLogger is not a function
  Location:
    /Users/sushichan044/workspace/github.com/sushichan044/reproductions/workspace/astro-7-node-adapter-11/node_modules/.pnpm/@astrojs+node@11.0.0-alpha.0_astro@7.0.0-alpha.1_@emnapi+core@1.10.0_@emnapi+runtime@1.10.0_/node_modules/@astrojs/node/dist/preview.js:9:23
  Stack trace:
    at createAppHandler (file:///Users/sushichan044/workspace/github.com/sushichan044/reproductions/workspace/astro-7-node-adapter-11/dist/server/entry.mjs:11466:21)
    at file:///Users/sushichan044/workspace/github.com/sushichan044/reproductions/workspace/astro-7-node-adapter-11/dist/server/entry.mjs:22323:15
    at async node:internal/modules/esm/loader:639:26
    at async preview (file:///Users/sushichan044/workspace/github.com/sushichan044/reproductions/workspace/astro-7-node-adapter-11/node_modules/.pnpm/astro@7.0.0-alpha.1_@emnapi+core@1.10.0_@emnapi+runtime@1.10.0/node_modules/astro/dist/core/preview/index.js:60:18)
    at async runCommand (file:///Users/sushichan044/workspace/github.com/sushichan044/reproductions/workspace/astro-7-node-adapter-11/node_modules/.pnpm/astro@7.0.0-alpha.1_@emnapi+core@1.10.0_@emnapi+runtime@1.10.0/node_modules/astro/dist/cli/index.js:211:22)
 ELIFECYCLE  Command failed with exit code 1.
```
