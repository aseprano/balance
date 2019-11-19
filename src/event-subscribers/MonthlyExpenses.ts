import { EventSubscriber } from "../tech/EventSubscriber";
import { EventBus } from "../tech/EventBus";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { DB } from "../tech/DB";
import { IncomingEvent } from "../tech/impl/IncomingEvent";

export class MonthlyExpenses implements EventSubscriber {
    constructor(private db: DB) {}

    subscribe(eventBus: EventBus): void {
        eventBus.on(AccountDebitedEvent.EventName, (e) => this.onAccountDebited(e));
    }

    async onAccountDebited(event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();
        const amount = Math.floor(payload['debit']['amount'] * 100);

        return this.db.insert(
            'monthly_expenses',
            {
                account_id: payload['id'],
                month: event.getDateFired().slice(0, 7),
                currency: payload['debit']['currency'],
                amount,
            },
            `amount = amount + ${amount}`,
        );
    }
    
}