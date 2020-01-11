import { EventHandler } from "./EventHandler";

export interface EventBus {

    /**
     * Registers an handler for an incoming event whose name matches the provided pattern
     * 
     * @param eventPattern 
     * @param handler 
     */
    on(eventPattern: string, handler: EventHandler): EventBus;

}