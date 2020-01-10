import { Event } from "../Event";

/**
 * EventRegistry is an abstraction for a registry used by Projectors.
 * Projector adds events to this registry to ensure that events are projected once.
 */
export interface EventRegistry {

    /**
     * Adds an event to the registry
     * 
     * @param event 
     * @returns true if the event has been added, false if it was already in the registry
     */
    store(event: Event): Promise<boolean>;

    /**
     * Clears the registry
     */
    clear(): Promise<void>;

}