import { RetryPolicy } from "../RetryPolicy";

export class NoRetryPolicy<T> implements RetryPolicy<T> {

    applyTo(f: () => Promise<T>): Promise<T> {
        return f();
    }

}