import { Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const pkg = require('../package.json');

  // Step 1: Register Workflows and Activities with the Worker and connect to
  // the Temporal server.
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: pkg.name ?? 'subscription-xstate',
  });
  // Worker connects to localhost by default and uses console.error for logging.
  // Customize the Worker by passing more options to create():
  // https://typescript.temporal.io/api/classes/worker.Worker
  // If you need to configure server connection parameters, see docs:
  // https://docs.temporal.io/typescript/security#encryption-in-transit-with-mtls

  console.log(`Worker listening on queue ${ worker.options.taskQueue }`)
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
