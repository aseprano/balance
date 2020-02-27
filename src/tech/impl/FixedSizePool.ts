import { AbstractPool } from "./AbstractPool";
import { Provider } from "../../lib/Provider";
import { Resource } from "../Pool";

/**
 * A pool that reuses a fixed number of resources
 */
export class FixedSizePool<T extends Resource> extends AbstractPool<T> {

    constructor(
        private poolSize: number,
        private resourceFactory: Provider<T>
    ) {
        super();

        if (poolSize < 1) {
            throw new Error('Invalid pool size');
        }

        while (poolSize-- > 0) {
            this.makeResourceAvailable(this.buildNewResource());
        }
    }
    
    private hasEnoughResources(): boolean {
        return this.size() === this.poolSize;
    }

    private buildNewResource(): T {
        return this.resourceFactory();
    }

    protected newResourceAsked(): T | undefined {
       if (!this.hasEnoughResources()) {
           return this.buildNewResource();
       }
    }

    protected canDispose(resource: T): boolean {
        return true;
    }

}