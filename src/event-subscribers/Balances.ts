import { EventSubscriber } from "../tech/EventSubscriber";
import { EventBus } from "../tech/EventBus";
import { AccountCreatedEvent } from "../events/AccountCreatedEvent";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../events/AccountCreditedEvent";
import { DB } from "../tech/DB";
import { IncomingEvent } from "../tech/impl/IncomingEvent";

export class Balances implements EventSubscriber {

    constructor(private db: DB) {}

    subscribe(eventBus: EventBus): void {
        eventBus
            .on(AccountCreatedEvent.EventName, (e) => this.onAccountCreated(e))
            .on(AccountDebitedEvent.EventName, (e) => this.onAccountDebited(e))
            .on(AccountCreditedEvent.EventName, (e) => this.onAccountCredited(e));
    }

    async onAccountCreated(event: IncomingEvent): Promise<void> {
        const account_id: string = event.getPayload()['id'];

        return this.db.insertIgnore(
            'balances',
            { account_id, currency: 'EUR', balance: 0 },
        );
    }

    async onAccountDebited(event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();
        const account_id: string = payload['id'];
        const amount: number = Math.floor(payload['debit']['amount'] * 100);
        const currency: string = payload['debit']['currency'];

        this.db.update(
            'balances',
            {balance: `balance - ${amount}`},
            {
                account_id,
                currency
            }
        ).then((ret) => {
            if (ret['affected_rows'] !== 0) {
                return ret;
            }

            return this.db.insert(
                'balances',
                {
                    account_id,
                    currency,
                    balance: amount
                },
                `balance = balance - ${amount}`
            );
        });
    }

    async onAccountCredited(event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();
        const account_id: string = payload['id'];
        const amount: number = Math.floor(payload['credit']['amount'] * 100);
        const currency: string = payload['credit']['currency'];

        return this.db.update(
            'balances',
            {balance: `balance + ${amount}`},
            {account_id, currency}
        ).then((ret) => {
            if (ret['affected_rows']) {
                return ret;
            }

            return this.db.insert(
                'balances',
                {
                    account_id,
                    currency,
                    balance: amount,
                },
                `balance = balance + ${amount}`
            );
        });
    }

}