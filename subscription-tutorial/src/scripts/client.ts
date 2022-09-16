import { Connection, WorkflowClient } from '@temporalio/client';
import { Subscription } from '../types';
import { SubscriptionsWorkflow } from '../workflows';
import { nanoid } from 'nanoid';

async function run() {
  // Connect to the default Server location (localhost:7233)
  const connection = await Connection.connect();
  const client = new WorkflowClient({
    connection,
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });

  // HACK shorten trial and billing periods for development use cases
  let development = true;

  let subscription: Subscription = {
    id: nanoid(),
    email: 'foo@bar',
    trialPeriod: development ? '2 minutes' : '14 days',
    billingPeriod: development ? '3 minutes' : '1 month',
    billingChargeAmount: 100,
    maxBillingPeriods: 6
  }

  const handle = await client.start(SubscriptionsWorkflow, {
    args: [subscription],
    taskQueue: 'subscription-tutorial',
    
    // HACK specific workflowId to allow cancel and billing clients to find the same workflow instance
    workflowId: 'subscription-business-id',
  });
  console.log(`Started workflow ${handle.workflowId}`);

  // optional: wait for client result
  console.log(await handle.result()); // Hello, Temporal!
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
