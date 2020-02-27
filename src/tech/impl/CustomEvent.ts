import { Event, EventPayload } from "../events/Event";

export class CustomEvent implements Event {

    constructor(private name: string, private payload?: EventPayload) {
        this.payload = Object.freeze(payload || {});
    }

    getName(): string {
        return this.name;
    }

    getPayload(): EventPayload {
        return this.payload!;
    }

}