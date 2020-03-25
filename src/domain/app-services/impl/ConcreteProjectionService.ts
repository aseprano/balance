import { ProjectionService } from "../ProjectionService";
import { ProjectorRegistrationService } from "../ProjectorRegistrationService";
import { DB } from "../../../tech/db/DB";
import { Queryable } from "../../../tech/db/Queryable";
import { IncomingEvent } from "../../../tech/impl/events/IncomingEvent";
import { Projector } from "../../../tech/projections/Projector";

export class ConcreteProjectionService implements ProjectionService {

    constructor(
        private projectors: ProjectorRegistrationService,
        private transactionManager: DB
    ) {}

    private async performInTransaction(f: (tx: Queryable) => Promise<void>): Promise<void> {
        return this.transactionManager
            .beginTransaction()
            .then((tx) => {
                return f(tx)
                    .then(() => tx.commit())
                    .catch((err: any) => {
                        console.debug(`*** ERROR: ${err.message}`);
                        tx.rollback();
                        return err;
                    });
            })
    }

    private async forwardEventToProjector(event: IncomingEvent, projector: Projector): Promise<void> {
        return this.performInTransaction((tx: Queryable) => projector.project(event, tx));
    }

    private async clearProjector(projector: Projector): Promise<void> {
        return this.performInTransaction((tx: Queryable) => projector.clear(tx));
    }

    async onEvent(event: IncomingEvent): Promise<void> {
        const projections = this.projectors
            .getByEventName(event.getName())
            .map((projector) => this.forwardEventToProjector(event, projector));

        return Promise.all(projections)
            .then(() => undefined);
    }
    
    async replay(event: IncomingEvent, projectorId: string): Promise<void> {
        return this.forwardEventToProjector(event, this.projectors.getById(projectorId));
    }

    async clear(projectorId: string): Promise<void> {
        return this.clearProjector(this.projectors.getById(projectorId));
    }

}