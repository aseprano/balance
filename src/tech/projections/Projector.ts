import { IncomingEvent } from "../impl/events/IncomingEvent";
import { Queryable } from "../db/Queryable";

/**
 * A Projector projects events to a projection (i.e.: a database table)
 */
export interface Projector {

    /**
     * The unique-id of the Projector
     * Each Projector instance must have its own, unique in the context of the microservice.
     */
    getId(): string;

    /**
     * Returns the list of event names that the Projector is interested in
     */
    getEventsOfInterest(): string[];

    /**
     * Projects an event to the Projection.
     * @param event 
     */
    project(event: IncomingEvent): Promise<void>;

    /**
     * Clears the projection. All the data must be erased.
     */
    clear(): Promise<void>;
    
}