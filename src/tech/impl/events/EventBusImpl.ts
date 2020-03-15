import { EventBus } from "../../events/EventBus";
import { Consumer } from "../../../lib/Conumer";
import { IncomingEvent } from "./IncomingEvent";

class EventSubscription {
    
    constructor(
        private namePattern: RegExp,
        private consumer: Consumer<IncomingEvent>
    ) {}

    private isSatisfiedBy(event: IncomingEvent): boolean {
        return this.namePattern.test(event.getName());
    }

    handle(event: IncomingEvent): void {
        if (this.isSatisfiedBy(event)) {
            this.consumer(event);
        }
    }
}

export class EventBusImpl implements EventBus {
    private subscriptions: EventSubscription[] = [];

    private isValidPattern(pattern: string): boolean {
        return pattern.length > 0 && /^\w+(\.(\w+|\*|\?))+$/i.test(pattern);
    }

    private createRegExpForEvent(eventName: string): RegExp {
        const matchString = eventName
            .replace(/[.]/g, '\\.')
            .replace(/[*]/g, '.*')
            .replace(/[?]/g, '(?:\\w+)');

        return new RegExp(`^${matchString}$`);
    }

    on(eventPattern: string, callback: Consumer<IncomingEvent>): EventBus {
        if (!this.isValidPattern(eventPattern)) {
            throw new Error(`Invalid event name in subscription: ${eventPattern}`);
        }

        this.subscriptions.push(
            new EventSubscription(
                this.createRegExpForEvent(eventPattern),
                callback
            )
        );

        return this;
    }

    handle(incomingEvent: IncomingEvent): boolean {
        //console.log(`*** Handling incoming event: ${JSON.stringify(incomingEvent)}`);
        
        this.subscriptions
            .forEach((subscription) => subscription.handle(incomingEvent));

        return true;
    }

}