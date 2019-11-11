/// <reference path='../../../node_modules/event-store-client/event-store-client.d.ts'/>

import { EventStore } from "../EventStore";
import { EventStoreConnectionProxy } from "./EventStoreConnectionProxy";
import { EventStream } from "../EventStream";
import { Event } from "../Event";
import { ICredentials, ExpectedVersion, OperationResult, ReadStreamResult, Connection } from "event-store-client";
import { Provider } from "../../Provider";
import { v4 } from "uuid/interfaces";
import { CustomEvent } from "../CustomEvent";
import { Pool } from "../../Pool";

export class EventStoreImpl implements EventStore {

    constructor(
        private connections: Pool<EventStoreConnectionProxy>,
        private credentials: ICredentials,
        private eventIdGenerator: Provider<v4>
    ) {
        
    }

    private newEventId(): string {
        return this.eventIdGenerator().toString();
    }

    private getConnection(): Promise<EventStoreConnectionProxy> {
        return this.connections.get();
    }

    private async connectAndPerformAction(f: (conn: Connection, resolve: any, reject: any) => void): Promise<any> {
        const conn = await this.getConnection();

        return new Promise((resolve, reject) => {
            return f(conn.getConnection(), resolve, reject);
        }).finally(() => {
            this.connections.dispose(conn);
        });
    }

    private async readEvents(streamId: string, fromEventNumber: number, toEventNumber: number): Promise<Event[]> {
        return this.connectAndPerformAction((conn: Connection, resolve: any, reject: any) => {
            const events: Event[] = [];
    
            conn.readStreamEventsForward(
                streamId,
                fromEventNumber,
                toEventNumber,
                false,
                false,
                (event) => {
                    events.push(new CustomEvent(event.eventType, event.data));
                },
                this.credentials,
                (completed) => {
                    if (completed.result === ReadStreamResult.Success) {
                        resolve(events)
                    } else {
                        reject(completed.error)
                    }
                }
            );
    });
    }
    
    async createStream(streamId: string, events: Event[]): Promise<void> {
        return this.connectAndPerformAction((conn,resolve,reject) => {
            conn.writeEvents(
                streamId,
                ExpectedVersion.NoStream,
                false,
                events.map(e => {
                    return {
                        eventId: this.newEventId(),
                        eventType: e.getName(),
                        data: e.getPayload(),
                        metadata: '',
                    }
                }),
                this.credentials,
                (completed) => {
                    if (completed.result === OperationResult.Success) {
                        resolve();
                    } else {
                        reject(completed.message);
                    }
                }
            )
        });
    }
    
    async appendToStream(streamId: string, events: Event[], expectedVersion: number): Promise<void> {
        return this.connectAndPerformAction((conn, resolve, reject) => {
            conn.writeEvents(
                streamId,
                expectedVersion,
                false,
                events.map(e => {
                    return {
                        eventId: this.newEventId(),
                        eventType: e.getName(),
                        data: e.getPayload(),
                        metadata: ''
                    }
                }),
                this.credentials,
                (onComplete) => {
                    if (onComplete.result === OperationResult.Success) {
                        resolve();
                    } else {
                        reject(onComplete.message);
                    }
                }
            )
        });
    }

    async readStream(streamId: string): Promise<EventStream> {
        const stream: EventStream = {
            events: [],
            version: -1
        };

        const chunkSize = 100;
        let numberOfEventsRead = 0;

        do {
            const events = await this.readEvents(streamId, stream.version + 1, stream.version + 1 + chunkSize);
            numberOfEventsRead = events.length;
            stream.events.push(...events);
            stream.version += numberOfEventsRead;
        } while (numberOfEventsRead !== 0 && numberOfEventsRead !== chunkSize);

        return Promise.resolve(stream);
    }

}