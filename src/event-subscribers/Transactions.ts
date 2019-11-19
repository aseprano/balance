import { EventSubscriber } from "../tech/EventSubscriber";
import { EventBus } from "../tech/EventBus";
import { Event } from "../tech/Event";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../events/AccountCreditedEvent";
import { DB } from "../tech/DB";
import { IncomingEvent } from "../tech/impl/IncomingEvent";

export class Transactions implements EventSubscriber {

    constructor(private db: DB) {}

    subscribe(eventBus: EventBus): void {
        eventBus.on(AccountCreditedEvent.EventName, (e) => this.onAccountCredited(e))
            .on(AccountDebitedEvent.EventName, (e) => this.onAccountDebited(e));
    }

    async onAccountCredited(event: IncomingEvent): Promise<void> {
        const payload: any = event.getPayload();

        return this.db.insert('transactions', {
            account_id: payload['id'],
            type: 'credit',
            amount: Math.floor(payload['credit']['amount'] * 100),
            currency: payload['credit']['currency'],
            date: event.getDateFired()
        });
    }

    async onAccountDebited(event: IncomingEvent): Promise<void> {
        return this.db.insert('transactions', {
            account_id: event.getPayload()['id'],
            type: 'debit',
            amount: Math.floor(event.getPayload()['amount'] * 100),
            currency: event.getPayload()['currency'],
            date: event.getDateFired()
        });
    }
    
}