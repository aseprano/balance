import { DBAbstractProjector } from "./DBAbstractProjector";
import { IncomingEvent } from "../tech/impl/events/IncomingEvent";
import { Queryable } from "../tech/db/Queryable";
import { AccountDebitedEvent } from "../domain/events/AccountDebitedEvent";
import { MonthlyExpensesProjection } from "./projections/MonthlyExpensesProjection";
import { MoneyRoundingService } from "../domain/domain-services/MoneyRoundingService";

export class MonthlyExpensesProjector extends DBAbstractProjector {

    constructor(private projection: MonthlyExpensesProjection, private roundingService: MoneyRoundingService) {
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
        const relevantMonth = eventDate.substr(0, 7); // YYYY-mm

        return this.projection
            .addMonthlyExpense(
                connection,
                payload['id'],
                relevantMonth,
                this.roundingService.toCents(payload['amount']),
                payload['currency']
            );
    }

    public async handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        return this.handleAccountDebitedEvent(event, connection);
    }

    public async handleClear(connection: Queryable): Promise<void> {
        return this.projection.clear(connection);
    }

}
