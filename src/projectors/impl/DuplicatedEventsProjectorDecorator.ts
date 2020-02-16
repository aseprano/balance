import { Projector } from "../../tech/projections/Projector";
import { EventRegistry } from "../../tech/projections/EventRegistry";
import { IncomingEvent } from "../../tech/impl/IncomingEvent";

export class DuplicatedEventsProjectorDecorator implements Projector {

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

    async project(event: IncomingEvent): Promise<void> {
        return this.registry
            .store(event, this.getId())
            .then((stored) => stored ? this.innerProjector.project(event) : undefined);
    }
    
    async clear(): Promise<void> {
        return this.innerProjector
            .clear()
            .then(() => this.registry.clear(this.getId()));
    }
    
}