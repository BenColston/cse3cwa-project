import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { loadConfigFromFile } from "@prisma/config";

const require = createRequire(import.meta.url);
const prismaRequire = createRequire(require.resolve("@prisma/config"));
const { deepmerge, deepmergeInto } = prismaRequire("deepmerge-ts");

test("Prisma resolves the reviewed patched deepmerge version", () => {
  const lock = require("../package-lock.json");
  const entry = lock.packages["node_modules/@prisma/config/node_modules/deepmerge-ts"]
    ?? lock.packages["node_modules/deepmerge-ts"];
  assert.equal(entry.version, "8.0.2");
});

test("regular nested configuration merging preserves inputs", () => {
  const first = { datasource: { url: "postgresql://localhost/test" }, flags: ["first"] };
  const second = { datasource: { shadowDatabaseUrl: "postgresql://localhost/shadow" }, flags: ["second"] };
  assert.deepEqual(deepmerge(first, second), {
    datasource: { url: first.datasource.url, shadowDatabaseUrl: second.datasource.shadowDatabaseUrl },
    flags: ["first", "second"],
  });
  assert.deepEqual(first.flags, ["first"]);
  assert.equal(first.datasource.shadowDatabaseUrl, undefined);
});

test("recursive object graphs do not exhaust the stack", () => {
  for (const merge of [(a, b) => deepmerge(a, b), (a, b) => deepmergeInto(a, b)]) {
    const left = {};
    const right = {};
    left.self = left;
    right.self = right;
    try {
      merge(left, right);
    } catch (error) {
      // A bounded cycle/depth rejection is acceptable; stack exhaustion is not.
      assert.doesNotMatch(String(error), /maximum call stack size exceeded/i);
      assert.match(String(error), /circular|cycle|depth/i);
    }
  }
});

test("Prisma loads a real JS configuration with the overridden merger", async () => {
  const prefix = join(resolve(tmpdir()), "cse3cwa-prisma-config-");
  const root = await mkdtemp(prefix);
  try {
    await writeFile(join(root, "prisma.config.mjs"),
      'export default { schema: "prisma/schema.prisma" };\n');
    const loaded = await loadConfigFromFile({ configRoot: root });
    assert.equal(loaded.error, undefined);
    assert.equal(loaded.config.schema, join(root, "prisma/schema.prisma"));
  } finally {
    assert.ok(resolve(root).startsWith(prefix));
    await rm(root, { recursive: true, force: true });
  }
});
