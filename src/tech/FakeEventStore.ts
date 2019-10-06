import { EventStore } from "./EventStore";
import { EventStream } from "./EventStream";
import { Event } from "./Event";
import { StreamNotFoundException } from "./exceptions/StreamNotFoundException";
import { StreamAlreadyExistingException } from "./exceptions/StreamAlreadyExistingException";
import { StreamConcurrencyException } from "./exceptions/StreamConcurrencyException";

export class FakeEventStore implements EventStore {
    private streams: Map<string, EventStream> = new Map();

    private streamExists(streamId: string): boolean {
        return this.streams.has(streamId);
    }

    getAllStreamsIds(): string[] {
        return [...this.streams.keys()];
    }

    createStream(streamId: string, events: Event[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.streamExists(streamId)) {
                reject(new StreamAlreadyExistingException());
            } else {
                this.streams.set(streamId, {
                    version: 1,
                    events
                });
                
                resolve();
            }
        });
    }
    
    appendToStream(streamId: string, events: Event[], expectedVersion: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.streamExists(streamId)) {
                reject(new StreamNotFoundException('Stream not found'));
            } else {
                const currentStream = this.streams.get(streamId)!;

                if (currentStream.version !== expectedVersion) {
                    reject(new StreamConcurrencyException('Wrong stream version'));
                }
    
                currentStream.events.push(...events);
                currentStream.version++;
    
                resolve();
            }
        });
    }

    readStream(streamId: string): Promise<EventStream> {
        return new Promise((resolve, reject) => {
            if (!this.streamExists(streamId)) {
                reject(new StreamNotFoundException(`Stream not found: ${streamId}`));
            }

            resolve(this.streams.get(streamId));
        });
    }

    setStream(streamId: string, stream: EventStream) {
        this.streams.set(streamId, stream);
    }

}