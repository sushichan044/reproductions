import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const workspaceDirectoryName = "workspace";

const workspaceRootDir = path.join(import.meta.dirname, "..", workspaceDirectoryName);

async function main() {
  const packageName = readPackageName(process.argv.slice(2));
  if (packageName === undefined) {
    console.log(usage());
    return;
  }

  validatePackageName(packageName);

  const packageDirectory = path.join(workspaceRootDir, packageName);

  try {
    await mkdir(packageDirectory);
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      throw new Error(`Workspace package already exists: ${packageName}`);
    }
    throw error;
  }

  await writeFile(
    path.join(packageDirectory, "package.json"),
    JSON.stringify(createPackageJson(packageName), null, 2) + "\n",
  );
  await writeFile(path.join(packageDirectory, "README.md"), `# ${packageName}\n`);

  console.log(`Created ${path.join(workspaceDirectoryName, packageName)}`);
}

function readPackageName(args: string[]) {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args,
    options: {
      help: {
        type: "boolean",
        short: "h",
      },
    },
  });

  if (values.help) {
    return undefined;
  }

  if (positionals.length !== 1) {
    throw new Error(usage());
  }

  return positionals[0];
}

function usage() {
  return "Usage: pnpm reproductions:new <package-name>";
}

function validatePackageName(packageName: string) {
  if (
    packageName.length === 0 ||
    packageName === "." ||
    packageName === ".." ||
    packageName !== path.basename(packageName) ||
    packageName.includes(path.win32.sep)
  ) {
    throw new Error("Package name must be a single workspace directory segment");
  }

  if (!/^[a-z0-9][a-z0-9._-]*$/.test(packageName)) {
    throw new Error(
      "Package name must start with a lowercase letter or number and contain only lowercase letters, numbers, dots, underscores, or hyphens",
    );
  }
}

function createPackageJson(packageName: string) {
  return {
    name: packageName,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {},
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
