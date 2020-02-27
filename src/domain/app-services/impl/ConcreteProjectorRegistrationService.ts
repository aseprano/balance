import { ProjectorRegistrationService } from "../ProjectorRegistrationService";
import { Projector } from "../../../tech/projections/Projector";

export class ConcreteProjectorRegistrationService implements ProjectorRegistrationService {
    private projectorsMap: Map<string, Projector> = new Map();
    private eventsMapping: Map<string, Projector[]> = new Map();

    private mapProjector(projector: Projector) {
        this.projectorsMap.set(projector.getId(), projector);
    }

    private createEventToProjectorMapping(eventName: string, projector: Projector) {
        if (!this.eventsMapping.has(eventName)) {
            this.eventsMapping.set(eventName, []);
        }

        this.eventsMapping.get(eventName)!.push(projector);
    }

    private registrationExists(projectorId: string): boolean {
        return this.projectorsMap.has(projectorId);
    }

    register(projector: Projector): void {
        if (this.registrationExists(projector.getId())) {
            throw new Error(`A projector has been already registered with id: ${projector.getId()}`);
        }
        
        this.mapProjector(projector);

        projector.getEventsOfInterest()
            .forEach((eventOfInterest) => this.createEventToProjectorMapping(eventOfInterest, projector));
    }
    
    getById(projectorId: string): Projector {
        if (!this.registrationExists(projectorId)) {
            throw new Error(`Projector not found: ${projectorId}`);
        }

        return this.projectorsMap.get(projectorId)!;
    }

    getByEventName(eventName: string): Projector[] {
        return this.eventsMapping.get(eventName) || [];
    }

}