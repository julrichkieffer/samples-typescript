import * as wf from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';

const { greet } = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});


export async function SubscriptionsWorkflow(name: string): Promise<string> {
  return await greet(name);
}
