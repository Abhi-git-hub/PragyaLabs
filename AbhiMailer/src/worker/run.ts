import { getStore } from '../db/store.js';
import { runWorker } from '../worker/worker.js';

// Standalone worker: `npm run worker`. Uses the SAME service layer as the API.
const store = getStore();
// eslint-disable-next-line no-console
console.log(`Mail Mania worker starting (store=${store.kind})`);
await runWorker(store, {
  onEvent: (line) => console.log(line),
});
