import { RetryPolicy } from "../RetryPolicy";
import { Predicate } from "../../Predicate";

export class LimitedRetryPolicy<T> implements RetryPolicy<T> {

    constructor(
        private maxNumberOfRetries: number,
        private retryableErrors: Predicate<Error>
    ) {
        if (maxNumberOfRetries < 1) {
            throw new Error('Invalid max number of retries');
        }
    }

    private shouldRetryError(error: Error): boolean {
        return this.retryableErrors(error);
    }

    async retry(f: () => Promise<T>): Promise<T> {
        let retryCount = 0;

        do {
            try {
                return await f();
            } catch (e) {
                if (!this.shouldRetryError(e) || ++retryCount >= this.maxNumberOfRetries) {
                    throw e;
                }
            }
        } while (true);
    }

}