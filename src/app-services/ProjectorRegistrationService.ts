import { Projector } from "../tech/projections/Projector";

export interface ProjectorRegistrationService {
    
    register(projector: Projector): void;

}