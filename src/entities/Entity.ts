import { EventStream } from "../tech/EventStream";
import { DomainEvent } from "../events/DomainEvent";

export interface Entity {

    restoreFromEventStream(stream: EventStream): void;

    commitEvents(): DomainEvent[];

    getVersion(): number;

}