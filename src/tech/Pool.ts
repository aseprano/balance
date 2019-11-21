export interface Resource {
    isValid(): boolean;
}

export interface Pool<T extends Resource> {

    get(): Promise<T>;

    dispose(resource: T): void;

}