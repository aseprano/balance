import { Event } from "./Event";
import { EventStream } from "./EventStream";

export interface EventStore {

    /**
     * 
     * @param streamId
     * @param events
     * @throws StreamAlreadyExistingException if the streamId already exists
     */
    createStream(streamId: string, events: Event[]): Promise<void>;

    /**
     * 
     * @param streamId 
     * @param events 
     * @param expectedVersion 
     * @throws StreamNotFoundException if the requested streamId does not exist
     * @throws StreamConcurrencyException if the expectedVersion does not match the current stream version
     */
    appendToStream(streamId: string, events: Event[], expectedVersion: number): Promise<void>;

    /**
     * 
     * @param streamId 
     * @throws StreamNotFoundException if the requested stream does not exist
     */
    readStream(streamId: string): Promise<EventStream>;

}