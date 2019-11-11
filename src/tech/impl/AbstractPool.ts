import { Pool, Resource } from "../../Pool";
import { Consumer } from "../../Conumer";

export abstract class AbstractPool<T extends Resource> implements Pool<T> {
    private resources: T[] = [];
    private waitingQueue: Consumer<T>[] = [];
    private resourcesInUse = 0;

    private waitForResourceToBecomeAvailable(): Promise<T> {
        return new Promise((resolve) => {
            this.waitingQueue.push(resolve);
        });
    }

    private pickOneWaitingConsumer(): Consumer<T> | undefined {
        return this.waitingQueue.shift();
    }

    private tryBuildNewResource() {
        const newResource = this.newResourceAsked();

        if (newResource !== undefined) {
            this.makeResourceAvailable(newResource);
        }
    }

    private consumeOneResource(): T|undefined {
        do {
            const resource = this.resources.shift();

            if (resource !== undefined && resource.isValid()) {
                return resource;
            } else {
                this.tryBuildNewResource();
            }
        } while (this.resources.length);
    }

    private disposeResource(resource: T): void {
        this.resources.push(resource);
    }

    protected makeResourceAvailable(resource: T): void {
        const consumer = this.pickOneWaitingConsumer();

        if (consumer) {
            this.resourcesInUse++;
            consumer(resource);
        } else {
            this.disposeResource(resource);
        }
    }

    protected abstract newResourceAsked(): T|undefined;

    protected abstract canDispose(resource: T): boolean;

    get(): Promise<T> {
        return new Promise<T>((resolve) => {
            const resource = this.consumeOneResource() || this.newResourceAsked();

            if (resource) {
                resolve(resource);
            } else {
                return this.waitForResourceToBecomeAvailable()
                    .then(resolve);
            }
        }).then((res) => {
            this.resourcesInUse++;
            return res;
        })
    }
    
    dispose(resource: T): void {
        this.resourcesInUse--;

        if (resource.isValid() && this.canDispose(resource)) {
            this.makeResourceAvailable(resource);
        } else {
            this.tryBuildNewResource();
        }
    }

    numberOfResourceInUse(): number {
        return this.resourcesInUse;
    }

    numberOfAvailableResources(): number {
        return this.resources.length;
    }

    size(): number {
        return this.numberOfResourceInUse() + this.numberOfAvailableResources();
    }

}