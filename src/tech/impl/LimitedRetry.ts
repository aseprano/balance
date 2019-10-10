import { RetryPolicy } from "../RetryPolicy";

export class LimitedRetry<T> implements RetryPolicy<T> {

    constructor(
        private maxAttempts: number,
        private errorTester: (t: any) => boolean
    ) {
        if (maxAttempts < 1) {
            throw new Error('Invalid max number of retries');
        }
    }

    private shouldRetryError(error: any): boolean {
        return this.errorTester(error);
    }

    async applyTo(f: () => Promise<T>): Promise<T> {
        let retryCount = 0;

        do {
            try {
                return await f();
            } catch (e) {
                if (!this.shouldRetryError(e) || ++retryCount === this.maxAttempts) {
                    throw e;
                }
            }
        } while (true);
    }

}