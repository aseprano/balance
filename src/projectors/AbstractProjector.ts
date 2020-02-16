import { Event } from "../tech/Event";
import { Projector } from "../tech/projections/Projector";

export abstract class AbstractProjector implements Projector
{

    /**
     * @inheritdoc
     */
    abstract getId(): string;

    /**
     * @inheritdoc
     */
    abstract getEventsOfInterest(): string[];

    public project(event: Event): Promise<void> {
        return this.handleIncomingEvent(event);
    }

    public clear(): Promise<void> {
        return this.handleClear();
    }

    public abstract handleIncomingEvent(event: Event): Promise<void>;

    public abstract handleClear(): Promise<void>;

}