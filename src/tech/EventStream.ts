import { Event } from "./Event";

export type EventStream = {
    events: Event[];
    version: number;
}
