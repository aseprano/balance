import { EventStream } from "../../tech/EventStream";
import { Event } from "../../tech/Event";
import { Entity } from "../Entity";
import { DomainEvent } from "../../events/DomainEvent";
import { Snapshot } from "../../tech/Snapshot";

export abstract class AbstractEntity implements Entity {
    private currentStreamVersion: number = 0;
    private uncommittedEvents: DomainEvent[] = [];

    protected appendUncommittedEvent(event: DomainEvent): void {
        this.uncommittedEvents.push(event);
        this.applyEvent(event);
    }

    public restoreFromEventStream(stream: EventStream, snapshot?: Snapshot): void {
        if (snapshot) {
            this.applySnapshot(snapshot);
            this.currentStreamVersion = snapshot.lastEventId;
        }
        
        if (stream.events.length) {
            stream.events.forEach(e => this.applyEvent(e));
            this.currentStreamVersion = stream.version;
        }

        this.afterRestore();
    }

    protected afterRestore() {}

    public getVersion(): number {
        return this.currentStreamVersion;
    }

    public commitEvents(): DomainEvent[] {
        return this.uncommittedEvents.splice(0);
    }

    protected abstract applySnapshot(snapshot: Snapshot): void;

    protected abstract applyEvent(event: Event): void;

    public abstract getSnapshot(): Snapshot;
    
}