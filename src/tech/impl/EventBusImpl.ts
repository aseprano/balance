import { EventBus } from "../events/EventBus";
import { Consumer } from "../../lib/Conumer";
import { IncomingEvent } from "./IncomingEvent";

class EventSubscription {
    
    constructor(
        private namePattern: RegExp,
        private consumer: Consumer<IncomingEvent>,
        private registrationKey?: string
    ) {}

    isSatisfiedBy(event: IncomingEvent): boolean {
        return this.namePattern.test(event.getName()) &&
            (!this.registrationKey || this.registrationKey === event.getRegistrationKey());
    }

    handle(event: IncomingEvent): void {
        this.consumer(event);
    }
}

export class EventBusImpl implements EventBus {
    private subscriptions: EventSubscription[] = [];

    private getSubscriptionsForEvent(event: IncomingEvent): EventSubscription[] {
        return this.subscriptions.filter((s) => s.isSatisfiedBy(event));
    }

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

    on(eventPattern: string, callback: Consumer<IncomingEvent>, registrationKey?: string): EventBus {
        if (!this.isValidPattern(eventPattern)) {
            throw new Error(`Invalid event name in subscription: ${eventPattern}`);
        }

        this.subscriptions.push(
            new EventSubscription(
                this.createRegExpForEvent(eventPattern),
                callback,
                registrationKey
            )
        );

        return this;
    }

    handle(incomingEvent: IncomingEvent): boolean {
        //console.log(`*** Handling incoming event: ${JSON.stringify(incomingEvent)}`);
        
        this.getSubscriptionsForEvent(incomingEvent)
            .forEach((subscription) => subscription.handle(incomingEvent));

        return true;
    }

}