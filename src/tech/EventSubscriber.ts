import { EventBus } from "./EventBus";

export interface EventSubscriber {

    subscribe(eventBus: EventBus): void;

}
