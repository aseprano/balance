import { IncomingEvent } from "../../tech/impl/events/IncomingEvent";
import { DB } from "../../tech/db/DB";
import { Projector } from "../../tech/projections/Projector";
const { Queue, QueueConsumer } = require('@darkbyte/aqueue');

interface ProjectionRequest {
    event: IncomingEvent,
    db: DB
}

export class QueuedProjector implements Projector {

    constructor(
        private wrappedProjector: Projector,
        private queue: Queue<ProjectionRequest>
    ) {
        const queueConsumer: QueueConsumer<ProjectionRequest> = new QueueConsumer(queue);

        queueConsumer.startConsuming((req) => {
            this.wrappedProjector.project(req.event, req.db);
        });
    }

    getId(): string {
        return this.wrappedProjector
            .getId();
    }

    getEventsOfInterest(): string[] {
        return this.wrappedProjector
            .getEventsOfInterest();
    }

    async project(event: IncomingEvent, connection: DB): Promise<void> {
        this.queue
            .push({event, db: connection});
    }

    async clear(connection: DB): Promise<void> {
        return this.wrappedProjector
            .clear(connection);
    }
   
}