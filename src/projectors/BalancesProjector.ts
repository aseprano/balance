import { Projector } from "../tech/projections/Projector";
import { IncomingEvent } from "../tech/impl/IncomingEvent";
import { AccountCreatedEvent } from "../events/AccountCreatedEvent";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../events/AccountCreditedEvent";
import { BalancesProjection } from "./BalancesProjection";

export class BalancesProjector implements Projector
{
    constructor(private projection: BalancesProjection) {}

    public getId(): string {
        return 'com.herrdoktor.projections.account_balances';
    }

    private async handleAccountCreated(event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();

        return this.projection
            .createBalance(payload['account_id'], payload['currency']);
    }

    private async handleAccountCredited(event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();
        
        return this.projection
            .updateBalance(payload['account_id'], payload['currency'], payload['amount']);
    }

    private async handleAccountDebited(event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();

        return this.projection
            .updateBalance(payload['account_id'], payload['currency'], -payload['amount']);
    }

    public getEventsOfInterest(): string[] {
        return [
            AccountCreatedEvent.EventName,
            AccountCreditedEvent.EventName,
            AccountDebitedEvent.EventName,
        ];
    }

    async project(event: IncomingEvent): Promise<void> {
        switch (event.getName()) {
            case AccountCreatedEvent.EventName:
                return this.handleAccountCreated(event);

            case AccountCreditedEvent.EventName:
                return this.handleAccountCredited(event);

            case AccountDebitedEvent.EventName:
                return this.handleAccountDebited(event);
        }
    }

    async clear(): Promise<void> {
        
    }

}