import { Projector } from "../../projections/Projector";
import { Event } from "../../Event";
import { EventRegistry } from "../../projections/EventRegistry";

export class ProjectorDecorator implements Projector {

    constructor(
        private innerProjector: Projector,
        private registry: EventRegistry
    ) {}

    getId(): string {
        return this.innerProjector.getId();
    }
    
    async clear(): Promise<void> {
        return this.innerProjector
            .clear()
            .then(() => this.registry.clear());
    }

    async project(event: Event): Promise<void> {
        return this.registry
            .store(event)
            .then((stored) => {
                return stored ? this.innerProjector.project(event) : undefined
            });
    }

}