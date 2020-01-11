import { Event } from "../tech/Event";
import { ProjectorRegistrationService } from "./ProjectorRegistrationService";

export interface ProjectionService extends ProjectorRegistrationService {

    onEvent(event: Event): Promise<void>;

    replay(event: Event, projectorId: string): Promise<void>;

    clear(projectorId: string): Promise<void>;

}