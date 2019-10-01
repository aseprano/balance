import { Event } from "./Event";
import { EventStream } from "./EventStream";

export interface EventStore {

    createStream(streamId: string, events: Event[]): Promise<void>;

    appendToStream(streamId: string, events: Event[], expectedVersion: number): Promise<void>;

    readStream(streamId: string, from: number, to?: number): Promise<EventStream>;

    readEntireStream(streamId: string): Promise<EventStream>;

}