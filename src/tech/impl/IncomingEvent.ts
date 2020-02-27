import { Event, EventPayload } from "../events/Event";

export class IncomingEvent implements Event {

    constructor(
        private id: string,
        private name: string,
        private dateFired: string,
        private payload: EventPayload,
        private streamName: string = '',
        private seq: number = 0
    ) {}

    getId(): string {
        return this.id;
    }

    getStreamName(): string {
        return this.streamName;
    }

    getSequence(): number {
        return this.seq;
    }

    getDateFired(): string {
        return this.dateFired;
    }
    
    getName(): string {
        return this.name;
    }
    
    getPayload(): EventPayload {
        return this.payload;
    }


}