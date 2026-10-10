import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL("../", import.meta.url));

test(
  "a packed installation builds all community maps without this checkout",
  { timeout: 120_000 },
  async () => {
    const directory = await mkdtemp(
      join(tmpdir(), "tileflow-community-consumer-"),
    );
    try {
      await execFile(
        "npm",
        ["pack", "--ignore-scripts", "--pack-destination", directory],
        { cwd: root },
      );
      // Some npm versions print prepare-script output even with --json and --ignore-scripts.
      // Inspect the archive itself so lifecycle logging cannot corrupt the package inventory.
      const archives = (await readdir(directory)).filter((file) =>
        file.endsWith(".tgz"),
      );
      assert.equal(archives.length, 1);
      const archive = join(directory, archives[0]);
      const inventory = await execFile("tar", ["-tf", archive]);
      const files = inventory.stdout
        .trim()
        .split("\n")
        .map((file) => file.replace(/^package\//u, ""));
      assert.ok(files.includes("LICENSE"));
      assert.ok(files.includes("NOTICE"));
      assert.ok(files.includes("THIRD_PARTY_NOTICES.md"));
      for (const id of ["cyberpunk", "terminal"]) {
        assert.ok(files.includes(`maps/${id}/assets/fonts/LICENSE.txt`));
        assert.ok(files.includes(`maps/${id}/assets/fonts/Oxanium-Medium.ttf`));
      }
      assert.ok(
        files.includes(
          "maps/super-tile-world/assets/fonts/PixelifySans-Regular.ttf",
        ),
      );
      assert.ok(
        files.includes("maps/super-tile-world/assets/fonts/LICENSE.txt"),
      );
      assert.ok(
        !files.some((file) => /node_modules|^\.env|^test\//u.test(file)),
      );

      const cwd = join(directory, "consumer");
      await mkdir(cwd);
      await writeFile(
        join(cwd, "package.json"),
        JSON.stringify({ private: true, type: "module" }),
      );
      await execFile(
        "npm",
        [
          "install",
          "--prefer-offline",
          "--ignore-scripts",
          "--no-audit",
          "--no-fund",
          "--package-lock=false",
          archive,
          "@tileflow/core@0.1.0-alpha.30",
          "@tileflow/dev@0.1.0-alpha.28",
        ],
        { cwd, maxBuffer: 2_000_000 },
      );
      await writeFile(
        join(cwd, "verify.mjs"),
        `
      import assert from 'node:assert/strict';
      import {writeFile} from 'node:fs/promises';
      import {createTileflowBuildArtifacts, disposeTileflowBuildArtifacts} from '@tileflow/dev';
      for (const [name, id, theme, fonts] of [['cyberpunk', 'cyberpunk', 'dark', 2], ['terminal', 'terminal', 'dark', 2], ['superTileWorld', 'super-tile-world', 'light', 3]]) {
        await writeFile('tileflow.config.ts',
          "import {" + name + "} from '@tileflow/community-maps'; export default " + name + ";");
        const result = await createTileflowBuildArtifacts({cwd: process.cwd()});
        try {
          assert.ok(result.styles[id][theme].layers.length > 50);
          assert.equal(result.assets.filter(file => file.fileName.endsWith('.ttf')).length, fonts);
          assert.ok(result.assets.some(file => file.fileName.endsWith('sprite.png')));
          assert.ok(result.assets.some(file => file.fileName.startsWith('fonts/licenses/')));
        } finally { await disposeTileflowBuildArtifacts(result); }
      }
      console.log('Packed maps resolve their icons and fonts.');
    `,
      );
      const result = await execFile(process.execPath, ["verify.mjs"], {
        cwd,
        maxBuffer: 2_000_000,
      });
      assert.match(result.stdout, /Packed maps resolve their icons and fonts/u);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
