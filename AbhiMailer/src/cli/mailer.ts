import fs from 'node:fs';
import { getStore } from '../db/store.js';
import { runPreflight } from '../campaigns/preflight.js';
import { importCsvCampaign } from '../campaigns/csv-import.js';
import { buildQueue } from '../queue/queue.js';
import { runWorker } from '../worker/worker.js';

// CLI shares the SAME backend/service layer as the UI (no separate engine).
// Usage:
//   npm run mailer -- --campaign <id>
//   npm run mailer -- import-csv --file campaign.csv --account <account-id> [--name N]
//                    [--mode row|template] [--subject S] [--body T] [--start]
const args = process.argv.slice(2);

function flag(name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

if (args[0] === 'import-csv') {
  const file = flag('--file');
  const accountId = flag('--account');
  if (!file || !accountId) {
    console.error('Usage: npm run mailer -- import-csv --file campaign.csv --account <account-id> [--name N] [--mode row|template] [--subject S] [--body T] [--start]');
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf8');
  const store = getStore();
  // Creates a DRAFT campaign by default — never sends on import alone.
  const result = await importCsvCampaign(store, text, {
    name: flag('--name') ?? file.replace(/^.*[/\\]/, ''),
    accountId,
    mode: (flag('--mode') as 'row' | 'template' | undefined) ?? undefined,
    subject: flag('--subject'),
    bodyText: flag('--body'),
  });
  console.log(JSON.stringify({
    campaign: result.campaign.id, status: result.campaign.status, mode: result.mode,
    total: result.total, imported: result.imported, rejected: result.rejected.length,
    suppressed: result.suppressed, queued: result.queued,
  }, null, 2));
  if (args.includes('--start')) {
    // Explicit launch gate: validate → preflight → start → work the queue.
    const c = (await store.getCampaign(result.campaign.id))!;
    const preflight = await runPreflight(store, c);
    console.log(JSON.stringify({ preflight }, null, 2));
    if (!preflight.ok) {
      console.error('Preflight failed — refusing to start.');
      process.exit(1);
    }
    await buildQueue(store, c);
    await store.updateCampaign(c.id, { status: 'RUNNING', started_at: new Date().toISOString() });
    await runWorker(store, { maxIterations: 100000, onEvent: (line) => console.log(line) });
  }
  console.log('done');
  process.exit(0);
}

// Optional CLI: npm run mailer -- --campaign <id>
const campaignIdx = args.indexOf('--campaign');
const campaignId = campaignIdx >= 0 ? args[campaignIdx + 1] : undefined;

if (!campaignId) {
  console.error('Usage: npm run mailer -- --campaign <id> | npm run mailer -- import-csv --file campaign.csv --account <account-id> [--start]');
  process.exit(1);
}

const store = getStore();
const campaign = await store.getCampaign(campaignId);
if (!campaign) {
  console.error('Campaign not found');
  process.exit(1);
}
const preflight = await runPreflight(store, campaign);
console.log(JSON.stringify({ preflight }, null, 2));
if (!preflight.ok) {
  console.error('Preflight failed — refusing to send.');
  process.exit(1);
}
await buildQueue(store, campaign);
await store.updateCampaign(campaign.id, { status: 'RUNNING', started_at: new Date().toISOString() });
await runWorker(store, {
  maxIterations: 100000,
  onEvent: (line) => console.log(line),
});
console.log('done');
