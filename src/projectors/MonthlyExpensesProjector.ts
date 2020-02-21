import { AbstractProjector } from "./AbstractProjector";
import { IncomingEvent } from "../tech/impl/IncomingEvent";
import { Queryable } from "../tech/db/Queryable";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { MonthlyExpensesProjection } from "./MonthlyExpensesProjection";

export class MonthlyExpensesProjector extends AbstractProjector {

    constructor(private projection: MonthlyExpensesProjection) {
        super();
    }

    getId(): string {
        return 'com.herrdoktor.projections.monthly_expenses';
    }
    
    getEventsOfInterest(): string[] {
        return [
            AccountDebitedEvent.EventName,
        ];
    }

    private async handleAccountDebitedEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        const payload = event.getPayload();
        const eventDate = event.getDateFired();

        return this.projection
            .addMonthlyExpense(
                connection,
                payload['id'],
                eventDate.substr(0, 7),
                payload['debit']['amount'],
                payload['debit']['currency']
            );
    }

    public async handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        return this.handleAccountDebitedEvent(event, connection);
    }

    public async handleClear(connection: Queryable): Promise<void> {
        return this.projection.clear(connection);
    }


}