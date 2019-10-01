import { Event } from "./Event";
import { EventStream } from "./EventStream";

export interface EventStore {

    createStream(streamId: string, events: Event[]): Promise<void>;

    appendToStream(streamId: string, events: Event[], expectedVersion: number): Promise<void>;

    readStream(streamId: string): Promise<EventStream>;

}