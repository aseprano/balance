import { RetryPolicy } from "../RetryPolicy";

export class NoRetryPolicy<T> implements RetryPolicy<T> {

    retry(f: () => Promise<T>): Promise<T> {
        return f();
    }

}