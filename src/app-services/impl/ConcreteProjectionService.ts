import { ProjectionService } from "../ProjectionService";
import { Event } from "../../tech/Event";
import { Projector } from "../../tech/projections/Projector";
import { Predicate } from "../../Predicate";
import { ProjectorRegistrationService } from "../ProjectorRegistrationService";

export class ConcreteProjectionService implements ProjectionService, ProjectorRegistrationService {
    private projectorsMap: Map<string, Projector> = new Map();
    private eventsMapping: Map<string, Projector[]> = new Map();

    /**
     * 
     * @param filter A predicate that states whether an event can be processed or not.
     */
    constructor(
        private filter: Predicate<Event> = () => true
    ) { }

    private getProjector(projectorId: string): Projector {
        const projector = this.map.get(projectorId);

        if (!projector) {
            throw new Error('Projector not found');
        }

        return projector;
    }

    private eventMustBeSkipped(event: Event): boolean {
        return !this.filter(event);
    }

    private registrationExists(projectorId: string): boolean {
        return this.projectorsMap.has(projectorId);
    }

    private bindEventToProjector(eventName: string, projector: Projector) {
        if (!this.eventsMapping.has(eventName)) {
            this.eventsMapping.set(eventName, []);
        }

        this.eventsMapping.get(eventName)!.push(projector);
    }

    private getProjectorsInterestedInEvent(eventName: string): Projector[] {
        return this.eventsMapping.get(eventName) ?? [];
    }

    register(projector: Projector): void {
        if (this.registrationExists(projector.getId())) {
            throw new Error(`A projector has been already registered with id: ${projector.getId()}`);
        }
        
        this.projectorsMap.set(projector.getId(), projector);

        projector.getEventsOfInterest()
            .forEach((eventOfInterest) => this.bindEventToProjector(eventOfInterest, projector));
    }

    async onEvent(event: Event): Promise<void> {
        if (this.eventMustBeSkipped(event)) {
            return;
        }

        this.getProjectorsInterestedInEvent(event.getName())
            .forEach((projector) => projector.project(event));
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