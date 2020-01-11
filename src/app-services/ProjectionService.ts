import { Event } from "../tech/Event";

export interface ProjectionService {

    onEvent(event: Event, projectorId: string): Promise<void>;

    replay(event: Event, projectorId: string): Promise<void>;

    clear(projectorId: string): Promise<void>;

}