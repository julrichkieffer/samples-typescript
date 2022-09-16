import { Connection, WorkflowClient } from '@temporalio/client';
import { CancelSubscription } from '../workflows';

async function run() {
  const connection = await Connection.connect();
  const client = new WorkflowClient({ connection });

  const handle = await client.getHandle('subscription-business-id');
  await handle.signal(CancelSubscription);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
