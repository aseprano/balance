import { ProjectionService } from "../ProjectionService";
import { Event } from "../../tech/Event";
import { Projector } from "../../tech/projections/Projector";
import { Predicate } from "../../Predicate";

export class ConcreteProjectionService implements ProjectionService {

    constructor(
        private map: Map<string, Projector>,
        private filter: Predicate<Event>
    ) { }

    private getProjector(projectorId: string): Projector {
        const projector = this.map.get(projectorId);

        if (!projector) {
            throw new Error('Projector not found');
        }

        return projector;
    }

    private isValidEvent(event: Event): boolean {
        return this.filter(event);
    }

    register(projector: Projector) {
        this.map.set(projector.getId(), projector);
    }

    async onEvent(event: Event, projectorId: string): Promise<void> {
        if (this.isValidEvent(event)) {
            return this.replay(event, projectorId);
        }
    }
    
    async replay(event: Event, projectorId: string): Promise<void> {
        return this.getProjector(projectorId)
            .project(event);
    }

    async clear(projectorId: string): Promise<void> {
        return this.getProjector(projectorId)
            .clear();
    }

}