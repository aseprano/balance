export interface Pool<T> {

    get(): Promise<T>;

    dispose(item: T): void;

}