import { ProjectionService } from "../ProjectionService";
import { ProjectorRegistrationService } from "../ProjectorRegistrationService";
import { IncomingEvent } from "../../../tech/impl/events/IncomingEvent";
import { Projector } from "../../../tech/projections/Projector";

export class ConcreteProjectionService implements ProjectionService {

    constructor(
        private projectors: ProjectorRegistrationService
    ) {}

    private doLog(message: string) {
        //console.log(`[ProjectionService] ${message}`);
    }

    private async forwardEventToProjector(event: IncomingEvent, projector: Projector): Promise<void> {
        this.doLog(`Forwarding event ${event.getName()} to projector ${projector.getId()}`);
        
        return projector.project(event)
            .then(() => {
                this.doLog(`Event ${event.getName()} successfully forwarded to ${projector.getId()}`);
            }).catch((error) => {
                this.doLog(`Error projecting event ${event.getName()} to ${projector.getId()}: ${error.message}`);
                return Promise.reject(error);
            });
    }

    private async clearProjector(projector: Projector): Promise<void> {
        return projector.clear();
    }

    async onEvent(event: IncomingEvent): Promise<void> {
        this.doLog(`*** OnEvent: ${event.getName()}`);
        
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