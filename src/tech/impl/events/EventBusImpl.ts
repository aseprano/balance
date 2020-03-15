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
    private eventPatterns: string[] = [];
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

    private addEventNameToList(eventNamePattern: string): void {
        if (this.eventPatterns.indexOf(eventNamePattern) === -1) {
            this.eventPatterns.push(eventNamePattern);
        }
    }

    on(eventNamePattern: string, callback: Consumer<IncomingEvent>): EventBus {
        if (!this.isValidPattern(eventNamePattern)) {
            throw new Error(`Invalid event name in subscription: ${eventNamePattern}`);
        }

        this.addEventNameToList(eventNamePattern);

        this.subscriptions.push(
            new EventSubscription(
                this.createRegExpForEvent(eventNamePattern),
                callback
            )
        );

        return this;
    }

    getListOfEventNames(): string[] {
        return this.eventPatterns.slice(0);
    }

    handle(incomingEvent: IncomingEvent): boolean {
        //console.log(`*** Handling incoming event: ${JSON.stringify(incomingEvent)}`);
        
        this.subscriptions
            .forEach((subscription) => subscription.handle(incomingEvent));

        return true;
    }

}