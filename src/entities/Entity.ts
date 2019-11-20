import { EventStream } from "../tech/EventStream";
import { Snapshot } from "../tech/Snapshot";
import { DomainEvent } from "../events/DomainEvent";

export interface Entity {

    restoreFromEventStream(stream: EventStream): void;

    commitEvents(): DomainEvent[];

    getVersion(): number;

    getSnapshot(): Snapshot;

}