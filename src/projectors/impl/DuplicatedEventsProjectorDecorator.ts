import { Projector } from "../../tech/projections/Projector";
import { EventRegistry } from "../../tech/projections/EventRegistry";
import { IncomingEvent } from "../../tech/impl/IncomingEvent";
import { Queryable } from "../../tech/db/Queryable";

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

    async project(event: IncomingEvent, connection: Queryable): Promise<void> {
        return this.registry
            .store(event, connection)
            .then((stored) => stored ? this.innerProjector.project(event, connection) : undefined);
    }
    
    async clear(connection: Queryable): Promise<void> {
        return this.innerProjector
            .clear(connection)
            .then(() => this.registry.clear(connection));
    }
    
}