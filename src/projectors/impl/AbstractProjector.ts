import { Projector } from "../../tech/projections/Projector";
import { IncomingEvent } from "../../tech/impl/events/IncomingEvent";
import { Queryable } from "../../tech/db/Queryable";

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

    public project(event: IncomingEvent, connetion: Queryable): Promise<void> {
        return this.handleIncomingEvent(event, connetion);
    }

    public clear(connection: Queryable): Promise<void> {
        return this.handleClear(connection);
    }

    public abstract handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void>;

    public abstract handleClear(connection: Queryable): Promise<void>;

}