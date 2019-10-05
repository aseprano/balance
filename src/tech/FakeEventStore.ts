import { EventStore } from "./EventStore";
import { EventStream } from "./EventStream";
import { Event } from "./Event";

export class FakeEventStore implements EventStore {
    private streams: Map<string, EventStream> = new Map();

    public setEvents(streamId: string, stream: EventStream) {
        this.streams.set(streamId, stream);
    }

    private streamExists(streamId: string): boolean {
        return this.streams.has(streamId);
    }

    getAllStreamsIds(): string[] {
        return [...this.streams.keys()];
    }

    createStream(streamId: string, events: Event[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.streamExists(streamId)) {
                reject(new Error('Stream already exists'));
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
                reject(new Error('Stream not found'));
            } else {
                const currentStream = this.streams.get(streamId)!;

                if (currentStream.version !== expectedVersion) {
                    reject(new Error('Wrong stream version'));
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
                reject(new Error('Stream not found'));
            }

            resolve(this.streams.get(streamId));
        });
    }

}