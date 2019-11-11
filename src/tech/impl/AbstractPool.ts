import { Pool } from "../Pool";
import { Consumer } from "../Conumer";

export abstract class AbstractPool<T> implements Pool<T> {
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

    private consumeOneResource(): T|undefined {
        return this.resources.shift();
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

        if (this.canDispose(resource)) {
            this.makeResourceAvailable(resource);
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