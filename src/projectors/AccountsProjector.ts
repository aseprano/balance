import { AbstractDBProjector } from "./AbstractDBProjector";
import { AccountCreatedEvent } from "../domain/events/AccountCreatedEvent";
import { IncomingEvent } from "../tech/impl/events/IncomingEvent";
import { Queryable } from "../tech/db/Queryable";
import { AccountProjection } from "./projections/AccountsProjection";

export class AccountsProjector extends AbstractDBProjector {

    public constructor(private projection: AccountProjection) {
        super();
    }
    
    private async handleAccountCreatedEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        const payload = event.getPayload();

        return this.projection.createAccount(
            connection,
            payload['id'],
            payload['owner'],
            event.getDateFired()
        );
    }

    getId(): string {
        return "com.herrdoktor.projections.accounts";
    }

    getEventsOfInterest(): string[] {
        return [
            AccountCreatedEvent.EventName
        ];
    }

    public async handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        console.log(`Handling incoming event: ${event.getName()}`);
        
        switch (event.getName()) {
            case AccountCreatedEvent.EventName:
                return this.handleAccountCreatedEvent(event, connection);
        }
    }

    public async handleClear(connection: Queryable): Promise<void> {
        return this.projection.deleteAll(connection);
    }   

}
