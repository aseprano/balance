export interface RetryPolicy<T> {

    retry(f: () => Promise<T>): Promise<T>;

}