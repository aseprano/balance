import { Projector } from "../../tech/projections/Projector";
import { EventBus } from "../../tech/EventBus";
import { Event } from "../../tech/Event";
import { ProjectionService } from "../ProjectionService";

export class ProjectionServiceEventRegistrationDecorator implements ProjectionService {

    constructor(
        private wrappedService: ProjectionService,
        private eventBus: EventBus
    ) {}

    register(projector: Projector): void {
        this.wrappedService.register(projector);
        
        projector.getEventsOfInterest()
            .forEach((eventOfInterest) => {
                this.eventBus.on(eventOfInterest, (e) => this.onEvent(e));
            });
    }

    onEvent(event: Event): Promise<void> {
        return this.wrappedService.onEvent(event);
    }

    replay(event: Event, projectorId: string): Promise<void> {
        return this.wrappedService.replay(event, projectorId);
    }

    clear(projectorId: string): Promise<void> {
        return this.wrappedService.clear(projectorId)
    }

}