import { Connection, WorkflowClient } from '@temporalio/client';
import { AmountChargedToDate } from '../workflows';

async function run() {
  const connection = await Connection.connect();
  const client = new WorkflowClient({ connection });

  const handle = await client.getHandle('subscription-business-id');
  let [amountChargedToDate] = await handle.query(AmountChargedToDate);
  console.log(amountChargedToDate);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
