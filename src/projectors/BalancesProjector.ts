import { Projector } from "../tech/projections/Projector";
import { IncomingEvent } from "../tech/impl/IncomingEvent";
import { AccountCreatedEvent } from "../events/AccountCreatedEvent";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { AccountCreditedEvent } from "../events/AccountCreditedEvent";
import { BalancesProjection } from "./BalancesProjection";
import { DB } from "../tech/db/DB";
import { Queryable } from "../tech/db/Queryable";
import { AbstractProjector } from "./AbstractProjector";

export class BalancesProjector extends AbstractProjector
{
    constructor(
        db: DB,
        private projection: BalancesProjection
    ) {
        super(db);
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

    private async handleAccountCreated(dbConnection: Queryable, event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();

        return Promise.all([
                this.projection.createBalance(dbConnection, payload['id'], 'EUR', 0),
                this.projection.createBalance(dbConnection, payload['id'], 'USD', 0)
            ])
            .then(() => undefined);
    }

    private async handleAccountCredited(dbConnection: Queryable, event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();
        
        return this.projection
            .updateBalance(dbConnection, payload['id'], payload['credit']['currency'], payload['credit']['amount']);
    }

    private async handleAccountDebited(dbConnection: Queryable, event: IncomingEvent): Promise<void> {
        const payload = event.getPayload();

        return this.projection
            .updateBalance(dbConnection, payload['id'], payload['debit']['currency'], -payload['debit']['amount']);
    }

    async handleIncomingEvent(event: IncomingEvent, dbConnection: Queryable): Promise<void> {
        switch (event.getName()) {
            case AccountCreatedEvent.EventName:
                return this.handleAccountCreated(dbConnection, event);

            case AccountCreditedEvent.EventName:
                return this.handleAccountCredited(dbConnection, event);

            case AccountDebitedEvent.EventName:
                return this.handleAccountDebited(dbConnection, event);
        }

    }

    async handleClear(dbConnection: Queryable): Promise<void> {
        return this.projection.clear(dbConnection);
    }

}