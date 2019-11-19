import { EventBus } from "../EventBus";
import { Consumer } from "../../Conumer";
import { IncomingEvent } from "./IncomingEvent";

interface EventConsumer {
    matchExp: RegExp;
    consumer: Consumer<IncomingEvent>;
}

export class EventBusImpl implements EventBus {
    private subscriptions: EventConsumer[] = [];

    private getSubscriptionsForEvent(eventName: string): EventConsumer[] {
        return this.subscriptions.filter(s => s.matchExp.test(eventName));
    }

    private isValidEventName(eventName: string): boolean {
        return eventName.length > 0 && /^\w+(\.(\w+|\*|\?))+$/i.test(eventName);
    }

    private createRegExpForEvent(eventName: string): RegExp {
        const matchString = eventName
            .replace(/[.]/g, '\\.')
            .replace(/[*]/g, '.*')
            .replace(/[?]/g, '(?:\\w+)');

        return new RegExp(`^${matchString}$`);
    }

    on(eventName: string, callback: Consumer<IncomingEvent>): EventBus {
        if (!this.isValidEventName(eventName)) {
            throw new Error('Invalid event name in subscription: ' + eventName);
        }

        this.subscriptions.push({
            matchExp: this.createRegExpForEvent(eventName),
            consumer: callback
        });

        return this;
    }

    handle(incomingEvent: IncomingEvent): boolean {
        const subscribers = this.getSubscriptionsForEvent(incomingEvent.getName());

        if (!subscribers.length) {
            return false;
        }

        for (const subscriber of subscribers) {
            subscriber.consumer(incomingEvent);
        }

        return true;
    }

}