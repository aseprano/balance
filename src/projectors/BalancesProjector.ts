import { AccountCreatedEvent } from "../events/AccountCreatedEvent";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../events/AccountCreditedEvent";
import { BalancesProjection } from "./BalancesProjection";
import { DB } from "../tech/db/DB";
import { AbstractProjector } from "./AbstractProjector";
import { Event } from "../tech/Event";

export class BalancesProjector extends AbstractProjector
{
    constructor(
        private projection: BalancesProjection
    ) {
        super();
    }

    public getId(): string {
        return 'com.herrdoktor.projections.account_balances';
    }

    public getEventsOfInterest(): string[] {
        return [
            AccountCreatedEvent.EventName,
            AccountCreditedEvent.EventName,
            AccountDebitedEvent.EventName,
        ];
    }

    private async handleAccountCreated(event: Event): Promise<void> {
        const payload = event.getPayload();

        return Promise.all([
            this.projection.createBalance(payload['id'], 'EUR', 0),
            this.projection.createBalance(payload['id'], 'USD', 0)
        ]).then(() => undefined);
    }

    private async handleAccountCredited(event: Event): Promise<void> {
        const payload = event.getPayload();
        
        return this.projection
            .updateBalance(payload['id'], payload['credit']['currency'], payload['credit']['amount']);
    }

    private async handleAccountDebited(event: Event): Promise<void> {
        const payload = event.getPayload();

        return this.projection
            .updateBalance(payload['id'], payload['debit']['currency'], -payload['debit']['amount']);
    }

    async handleIncomingEvent(event: Event): Promise<void> {
        switch (event.getName()) {
            case AccountCreatedEvent.EventName:
                return this.handleAccountCreated(event);

            case AccountCreditedEvent.EventName:
                return this.handleAccountCredited(event);

            case AccountDebitedEvent.EventName:
                return this.handleAccountDebited(event);
        }

    }

    async handleClear(): Promise<void> {
        return this.projection.clear();
    }

}