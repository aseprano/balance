import { Projector } from "../../tech/projections/Projector";
import { Event } from "../../tech/Event";
import { DB } from "../../tech/db/DB";
import { DBConnectionProxy } from "../../tech/db/impl/DBConnectionProxy";

export class TransactionalProjectorDecorator implements Projector {

    constructor(
        private innerProjector: Projector,
        private db: DB,
        private connectionProxy: DBConnectionProxy
    ) {}

    private runInTransaction(f: () => Promise<void>): Promise<void> {
        return this.db.beginTransaction()
            .then((tx) => {
                this.connectionProxy.setConnection(tx);
                
                return f()
                    .then((ret) => {
                        tx.commit();
                        return ret;
                    })
                    .catch((err: any) => {
                        tx.rollback();
                        return err;
                    });
            });
    }

    getId(): string {
        return this.innerProjector.getId();
    }
    
    getEventsOfInterest(): string[] {
        return this.innerProjector.getEventsOfInterest();
    }

    clear(): Promise<void> {
        return this.runInTransaction(() => this.innerProjector.clear());
    }

    project(event: Event): Promise<void> {
        return this.runInTransaction(() => this.innerProjector.project(event));
    }

}