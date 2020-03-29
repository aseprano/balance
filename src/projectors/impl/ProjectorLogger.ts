import { Projector } from "../../tech/projections/Projector";
import { IncomingEvent } from "../../tech/impl/events/IncomingEvent";
import { Queryable } from "../../tech/db/Queryable";

export class ProjectorLogger implements Projector {

    constructor(private innerProjector: Projector) {}

    getId(): string {
        return this.innerProjector.getId();
    }

    getEventsOfInterest(): string[] {
        return this.innerProjector.getEventsOfInterest();
    }

    private doLog(message: string) {
        //console.debug(`[${this.getId()}] ${message}`);
    }

    async project(event: IncomingEvent, connection: Queryable): Promise<void> {
        this.doLog(`Projecting event ${event.getName()}`);

        return this.innerProjector.project(event, connection)
            .then(() => {
                this.doLog(`Event ${event.getName()} projected`);
            }).catch((error) => {
                this.doLog(`Error projecting event ${event.getName()}: ${error.message}`);
                return Promise.reject(error);
            });
    }

    async clear(connection: Queryable): Promise<void> {
        this.doLog(`Clearing projection`);

        return this.innerProjector.clear(connection)
            .then(() => {
                this.doLog('Projection cleared');
            }).catch((error) => {
                this.doLog(`Error clearing projection: ${error.message}`);
                return Promise.reject(error);
            });
    }

}