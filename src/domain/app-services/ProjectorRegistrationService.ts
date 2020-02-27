import { Projector } from "../../tech/projections/Projector";

export interface ProjectorRegistrationService {
    
    register(projector: Projector): void;

    getById(projetorId: string): Projector;

    getByEventName(eventName: string): Projector[];

}