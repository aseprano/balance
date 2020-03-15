import { IncomingEvent } from "../impl/events/IncomingEvent";
import { Queryable } from "../db/Queryable";

/**
 * EventRegistry is an abstraction for a registry used by Projectors.
 * Projector adds events to this registry to ensure that events are projected once.
 */
export interface EventRegistry {

    /**
     * Adds an event to the registry for a specific projectionId
     * 
     * @param event 
     * @returns true if the event has been added, false if it was already in the registry
     */
    store(event: IncomingEvent, connection: Queryable): Promise<boolean>;

    /**
     * Clears the registry for the specified projection
     */
    clear(connection: Queryable): Promise<void>;

}