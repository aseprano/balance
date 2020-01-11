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

    getEventsOfInterest(): string[] {
        return this.innerProjector
            .getEventsOfInterest();
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