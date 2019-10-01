import { Event } from "./Event";

export type EventStream = {
    events: Event[];
    streamVersion: number;
}
