import { Connection, WorkflowClient } from '@temporalio/client';
import { connectionOptions, namespace } from './connection';
import { example } from './workflows';

async function run() {
  const connection = await Connection.connect(connectionOptions);

  const client = new WorkflowClient({
    connection,
    namespace,
  });

  const result = await client.execute(example, {
    taskQueue: 'production-sample',
    workflowId: 'production-sample-0',
    args: ['Temporal'],
  });
  console.log(result); // Hello, Temporal!
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
