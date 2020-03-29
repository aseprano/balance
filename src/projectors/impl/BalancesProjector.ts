import { DBAbstractProjector } from "./DBAbstractProjector";
import { AccountCreatedEvent } from "../../domain/events/AccountCreatedEvent";
import { AccountDebitedEvent } from "../../domain/events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../../domain/events/AccountCreditedEvent";
import { BalancesProjection } from "../BalancesProjection";
import { IncomingEvent } from "../../tech/impl/events/IncomingEvent";
import { Queryable } from "../../tech/db/Queryable";

export class BalancesProjector extends DBAbstractProjector
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

    private async handleAccountCreated(event: IncomingEvent, connection: Queryable): Promise<void> {
        const payload = event.getPayload();

        return Promise.all([
            this.projection.createBalance(connection, payload['id'], 'EUR', 0),
            this.projection.createBalance(connection, payload['id'], 'USD', 0)
        ]).then(() => undefined);
    }

    private async handleAccountCredited(event: IncomingEvent, connection: Queryable): Promise<void> {
        const payload = event.getPayload();
        
        return this.projection
            .updateBalance(connection, payload['id'], payload['credit']['currency'], payload['credit']['amount']);
    }

    private async handleAccountDebited(event: IncomingEvent, connection: Queryable): Promise<void> {
        const payload = event.getPayload();

        return this.projection
            .updateBalance(connection, payload['id'], payload['debit']['currency'], -payload['debit']['amount']);
    }

    async handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        switch (event.getName()) {
            case AccountCreatedEvent.EventName:
                return this.handleAccountCreated(event, connection);

            case AccountCreditedEvent.EventName:
                return this.handleAccountCredited(event, connection);

            case AccountDebitedEvent.EventName:
                return this.handleAccountDebited(event, connection);
        }

    }

    async handleClear(connection: Queryable): Promise<void> {
        return this.projection.clear(connection);
    }

}