/**
 * Asset checker — `npm run assets:check`.
 * Validates public/assets-manifest.json: every file flagged `required: true`
 * on a concept/production asset must exist. Planned assets are reported
 * as pending (informational, exit 0). Missing required files exit 1.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "public", "assets-manifest.json");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

let missing = [];
let pending = [];
let ok = 0;

for (const asset of manifest.assets ?? []) {
  const files = asset.files ?? [];
  if (files.length === 0) {
    pending.push(`${asset.name} (${asset.status}) — no files yet`);
    continue;
  }
  for (const f of files) {
    const full = join(root, f.path);
    if (existsSync(full)) {
      ok++;
    } else if (f.required) {
      missing.push(`${asset.name}: ${f.path}`);
    } else {
      pending.push(`${asset.name}: ${f.path} (optional)`);
    }
  }
}

console.log(`assets:check — ${ok} file(s) present, ${pending.length} pending, ${missing.length} missing.`);
for (const p of pending) console.log(`  PENDING  ${p}`);
for (const m of missing) console.log(`  MISSING  ${m}`);

process.exit(missing.length > 0 ? 1 : 0);
