import { Event } from "../../tech/events/Event";
import { ProjectorRegistrationService } from "./ProjectorRegistrationService";

export interface ProjectionService {

    onEvent(event: Event): Promise<void>;

    replay(event: Event, projectorId: string): Promise<void>;

    clear(projectorId: string): Promise<void>;

}