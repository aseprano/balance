import { Event, EventPayload } from "../tech/Event";

export abstract class DomainEvent implements Event {
    private payload: EventPayload = Object.freeze({});

    protected setPayload(payload: EventPayload): void {
        this.payload = Object.freeze(payload);
    }

    public getPayload(): EventPayload {
        return this.payload;
    }
    
    public abstract getName(): string;

}