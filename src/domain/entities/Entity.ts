import { EventStream } from "../../tech/events/EventStream";
import { Snapshot } from "../../tech/Snapshot";
import { DomainEvent } from "../events/DomainEvent";

export interface Entity {

    restoreFromEventStream(stream: EventStream, snapshot?: Snapshot): void;

    commitEvents(): DomainEvent[];

    getVersion(): number;

    getSnapshot(): Snapshot;

    getId(): any;
    
}