import { Projector } from "../tech/projections/Projector";
import { IncomingEvent } from "../tech/impl/events/IncomingEvent";
import { Queryable } from "../tech/db/Queryable";
import { DB } from "../tech/db/DB";
import { Function } from "../lib/Function";

export abstract class AbstractDBProjector implements Projector
{
    private handledEventsTableName: string = 'handled_events';
    private db?: DB;

    /**
     * @inheritdoc
     */
    abstract getId(): string;

    /**
     * @inheritdoc
     */
    abstract getEventsOfInterest(): string[];

    private performInTransaction(callback: Function<Queryable, Promise<void>>): Promise<void> {
        return this.db!.beginTransaction()
            .then((tx) => {
                return callback(tx)
                    .then(() => tx.commit())
                    .catch((error) => {
                        tx.rollback();
                        return Promise.reject(error);
                    });
            });
    }

    private markEventAsHandled(event: IncomingEvent, connection: Queryable): Promise<void> {
        return connection.query(
            `INSERT INTO ${this.handledEventsTableName} (projection_id, event_id) VALUES (?, ?)`,
            [
                this.getId(),
                event.getId()
            ]
        ).then((result) => {
            return result.numberOfAffectedRows ? undefined : Promise.reject(new Error('Event already handled'));
        });
    }

    private markAllEventsAsNonHandled(connection: Queryable): Promise<void> {
        return connection.query(`DELETE FROM handled_events WHERE projection_id = ?`, [this.getId()])
            .then(() => undefined);
    }

    public project(event: IncomingEvent): Promise<void> {
        return this.performInTransaction((tx) => {
            return this.markEventAsHandled(event, tx)
                .then(() => this.handleIncomingEvent(event, tx));
        });
    }

    public clear(): Promise<void> {
        return this.performInTransaction((tx) => {
            return this.markAllEventsAsNonHandled(tx)
                .then(() => this.handleClear(tx));
        });
    }

    public setHandledEventsTableName(tableName: string) {
        this.handledEventsTableName = tableName;
    }

    public setDB(db: DB) {
        this.db = db;
    }

    public abstract handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void>;

    public abstract handleClear(connection: Queryable): Promise<void>;

}