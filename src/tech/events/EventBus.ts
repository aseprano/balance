import { EventHandler } from "./EventHandler";

export interface EventBus {

    /**
     * Registers an handler for an incoming event whose name matches the provided pattern
     * 
     * @param eventPattern 
     * @param handler
     * @param registrationKey handler is invoked if the registrationKey of the IncomingEvent matches
     */
    on(eventPattern: string, handler: EventHandler, registrationKey?: string): EventBus;

}