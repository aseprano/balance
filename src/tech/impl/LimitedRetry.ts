import { RetryPolicy } from "../RetryPolicy";

export class LimitedRetry<T> implements RetryPolicy<T> {

    constructor(private maxNumberOfRetries: number) {
        if (maxNumberOfRetries < 1) {
            throw new Error('Invalid max number of retries');
        }
    }

    async applyTo(f: () => Promise<T>): Promise<T> {
        let retryCount = 0;

        do {
            try {
                return await f();
            } catch (e) {
                if (++retryCount === this.maxNumberOfRetries) {
                    throw e;
                }
            }
        } while (true);
    }

}