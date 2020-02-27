import { EventBus } from "../EventBus";
import { Consumer } from "../../lib/Conumer";
import { IncomingEvent } from "./IncomingEvent";

interface EventConsumer {
    matchExp: RegExp;
    consumer: Consumer<IncomingEvent>;
}

export class EventBusImpl implements EventBus {
    private subscriptions: EventConsumer[] = [];

    private getSubscriptionsForEvent(eventName: string): EventConsumer[] {
        return this.subscriptions.filter((s) => s.matchExp.test(eventName));
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

    on(eventPattern: string, callback: Consumer<IncomingEvent>): EventBus {
        if (!this.isValidPattern(eventPattern)) {
            throw new Error(`Invalid event name in subscription: ${eventPattern}`);
        }

        this.subscriptions.push({
            matchExp: this.createRegExpForEvent(eventPattern),
            consumer: callback
        });

        return this;
    }

    handle(incomingEvent: IncomingEvent): boolean {
        //console.log(`*** Handling incoming event: ${JSON.stringify(incomingEvent)}`);
        
        this.getSubscriptionsForEvent(incomingEvent.getName())
            .forEach((sub) => {
                sub.consumer(incomingEvent);
            });

        return true;
    }

}