import { EventHandler } from "./EventHandler";

export interface EventBus {

    on(eventName: string, handler: EventHandler): EventBus;

}