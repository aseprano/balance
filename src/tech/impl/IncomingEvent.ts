import { Event, EventPayload } from "../Event";

export class IncomingEvent implements Event {

    constructor(
        private id: string,
        private name: string,
        private dateFired: string,
        private payload: EventPayload
    ) {}

    getId(): string {
        return this.id;
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