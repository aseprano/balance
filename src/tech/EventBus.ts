import { Consumer } from "../Conumer";
import { Event } from "./Event";

export interface EventBus {

    on(eventName: string, callback: Consumer<Event>): EventBus;

}