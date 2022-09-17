import { Connection, WorkflowClient } from '@temporalio/client';
import { SubscriptionWorkflow } from '../workflows';
import { nanoid } from 'nanoid';
import ms from 'ms';
import { Subscription } from '../types';

async function run() {
  const connection = await Connection.connect();
  const client = new WorkflowClient({ connection });

  const pkg = require('../../package.json');

  // HACK
  let production = false;
  let subscription: Subscription = {
    id: nanoid(),
    email: 'foo@bar',
    trialPeriod: production ? ms('14 days') : ms('10s'),
    billingPeriod: production ? ms('1 month'): ms('20s'),
    billingChargeAmount: 100,
    maxBillingPeriods: 6
  }

  const handle = await client.start(SubscriptionWorkflow, {
    taskQueue: pkg.name ?? 'subscription-xstate',
    workflowId: `${ pkg.name }-business-key`,
    args: [subscription],
  });
  console.log(`Started workflow ${handle.workflowId}`);

  console.log(await handle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
