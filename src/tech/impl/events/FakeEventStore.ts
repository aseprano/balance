import { EventStore } from "../../events/EventStore";
import { EventStream } from "../../events/EventStream";
import { Event } from "../../events/Event";
import { StreamNotFoundException } from "../../exceptions/StreamNotFoundException";
import { StreamAlreadyExistingException } from "../../exceptions/StreamAlreadyExistingException";
import { StreamConcurrencyException } from "../../exceptions/StreamConcurrencyException";

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
        return this.readStreamOffset(streamId, 0);
    }

    readStreamOffset(streamId: string, readStreamOffset: number): Promise<EventStream> {
        return new Promise((resolve, reject) => {
            const stream = this.streams.get(streamId);

            if (stream) {
                resolve({
                    version: stream.version,
                    events: stream.events.slice(readStreamOffset)
                });
            } else {
                reject(new StreamNotFoundException(`Stream not found: ${streamId}`));
            }
        });
    }

    setStream(streamId: string, stream: EventStream) {
        this.streams.set(streamId, stream);
    }

}