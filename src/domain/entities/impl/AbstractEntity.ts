import { EventStream } from "../../../tech/events/EventStream";
import { Event } from "../../../tech/events/Event";
import { Entity } from "../Entity";
import { DomainEvent } from "../../events/DomainEvent";
import { Snapshot, SnapshotState } from "../../../tech/Snapshot";

export abstract class AbstractEntity implements Entity {
    private currentStreamVersion: number = -1;
    private uncommittedEvents: DomainEvent[] = [];

    protected appendUncommittedEvent(event: DomainEvent): void {
        this.uncommittedEvents.push(event);
        this.applyEvent(event);
    }

    protected afterRestore() {}

    public restoreFromEventStream(stream: EventStream, snapshot?: Snapshot): void {
        if (snapshot) {
            this.applySnapshot(snapshot.state);
            this.currentStreamVersion = snapshot.version;
        }
        
        if (stream.events.length) {
            stream.events.forEach((e) => this.applyEvent(e));
            this.currentStreamVersion = stream.version;
        }

        this.afterRestore();
    }

    public getVersion(): number {
        return this.currentStreamVersion;
    }

    public commitEvents(): DomainEvent[] {
        const events = this.uncommittedEvents.splice(0);
        this.currentStreamVersion += events.length;
        return events;
    }

    public getSnapshot(): Snapshot {
        const snapshotState = this.buildSnapshot();
        
        return {
            state: snapshotState,
            version: this.getVersion(),
        };
    }

    protected abstract buildSnapshot(): SnapshotState;

    protected abstract applySnapshot(snapshot: SnapshotState): void;

    protected abstract applyEvent(event: Event): void;
    
    public abstract getId(): any;
    
}