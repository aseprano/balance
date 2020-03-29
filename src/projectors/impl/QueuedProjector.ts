import { IncomingEvent } from "../../tech/impl/events/IncomingEvent";
import { Projector } from "../../tech/projections/Projector";
import { Queue, QueueConsumer } from "@darkbyte/aqueue";

export class QueuedProjector implements Projector {
    private queuedEvents: Queue<IncomingEvent> = new Queue();

    constructor(
        private wrappedProjector: Projector,
        
    ) {
        const queueConsumer: QueueConsumer<IncomingEvent> = new QueueConsumer(this.queuedEvents);
        queueConsumer.startConsuming((event) => this.wrappedProjector.project(event));
    }

    getId(): string {
        return this.wrappedProjector
            .getId();
    }

    getEventsOfInterest(): string[] {
        return this.wrappedProjector
            .getEventsOfInterest();
    }

    async project(event: IncomingEvent): Promise<void> {
        this.queuedEvents.push(event);
    }

    async clear(): Promise<void> {
        return this.wrappedProjector
            .clear();
    }
   
}