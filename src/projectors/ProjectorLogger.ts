import { Projector } from "../tech/projections/Projector";
import { IncomingEvent } from "../tech/impl/events/IncomingEvent";

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

    async project(event: IncomingEvent): Promise<void> {
        this.doLog(`Projecting event ${event.getName()}`);

        return this.innerProjector
            .project(event)
            .then(() => {
                this.doLog(`Event ${event.getName()} projected`);
            }).catch((error) => {
                this.doLog(`Error projecting event ${event.getName()}: ${error.message}`);
                return Promise.reject(error);
            });
    }

    async clear(): Promise<void> {
        this.doLog(`Clearing projection`);

        return this.innerProjector
            .clear()
            .then(() => {
                this.doLog('Projection cleared');
            }).catch((error) => {
                this.doLog(`Error clearing projection: ${error.message}`);
                return Promise.reject(error);
            });
    }

}
