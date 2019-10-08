export interface RetryPolicy<T> {

    applyTo(f: () => Promise<T>): Promise<T>;

}