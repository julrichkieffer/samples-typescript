import { CancellationScope, isCancellation, sleep } from "@temporalio/workflow";

/**
 * Define a custom implementation of the clock used by XState to handle
 * `delayed transitions`, that is transitions that occur after some time.
 * By default it uses `setTimeout` and `clearTimeout`.
 * Here we want to ditch the default implementation and use Temporal `sleep` function.
 * We run `sleep` in a cancellation scope returned by `setTimeout`
 * so that in `clearTimeout` the timer can actually be cancelled.
 */
export default {
    clock: {
        setTimeout(fn: any, timeout: string | number) {
            console.log(`setTimeout called for ${timeout}`);
            const scope = new CancellationScope();
    
            scope
                .run( () => {
                    console.log(`sleep called for ${timeout}`);
                    return sleep(timeout).then(fn);
                })
                .catch( err => {
                    if (isCancellation(err)) return;
                    throw err;
                });
    
            return scope;
        },
    
        clearTimeout(scope: CancellationScope) {
            scope.cancel();
        }
    }
}