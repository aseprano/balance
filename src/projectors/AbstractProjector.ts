import { Projector } from "../tech/projections/Projector";
import { IncomingEvent } from "../tech/impl/IncomingEvent";
import { DB } from "../tech/db/DB";
import { Queryable } from "../tech/db/Queryable";

export abstract class AbstractProjector implements Projector
{

    constructor(private db: DB) {}

    /**
     * @inheritdoc
     */
    abstract getId(): string;

    /**
     * @inheritdoc
     */
    abstract getEventsOfInterest(): string[];

    public project(event: IncomingEvent): Promise<void> {
        return this.db.beginTransaction()
            .then((tx) => this.handleIncomingEvent(event, tx)
                .then(() => tx.commit())
                .catch((err: any) => {
                    tx.rollback();
                    return err;
                })
            );
    }

    public clear(): Promise<void> {
        return this.db.beginTransaction()
            .then((tx) => this.handleClear(tx)
                .then(() => tx.commit())
                .catch((err: any) => {
                    tx.rollback();
                    return err;
                })
            );
    }

    public abstract handleIncomingEvent(event: IncomingEvent, dbConnection: Queryable): Promise<void>;

    public abstract handleClear(dbConnection: Queryable): Promise<void>;

}