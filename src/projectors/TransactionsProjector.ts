import { DBAbstractProjector } from "./DBAbstractProjector";
import { AccountCreditedEvent } from "../domain/events/AccountCreditedEvent";
import { AccountDebitedEvent } from "../domain/events/AccountDebitedEvent";
import { IncomingEvent } from "../tech/impl/events/IncomingEvent";
import { Queryable } from "../tech/db/Queryable";
import { TransactionsProjection, TransactionType, Transaction } from "./projections/TransactionsProjection";
import { MoneyRoundingService } from "../domain/domain-services/MoneyRoundingService";

const projectorId = 'com.herrdoktor.projections.transactions';

export class TransactionsProjector extends DBAbstractProjector {

    static get ID() {
        return projectorId;
    }

    constructor(
        private projection: TransactionsProjection,
        private roundService: MoneyRoundingService
    ) {
        super();
    }

    getId(): string {
        return projectorId;
    }

    getEventsOfInterest(): string[] {
        return [
            AccountCreditedEvent.EventName,
            AccountDebitedEvent.EventName,
        ];
    }

    private isDebit(event: IncomingEvent): boolean {
        return event.getName() === AccountDebitedEvent.EventName;
    }

    private createTransactionOfType(type: TransactionType, event: IncomingEvent): Transaction {
        const eventPayload = event.getPayload();

        return {
            accountId: eventPayload['id'],
            type: type,
            date: event.getDateFired(),
            amountInCents: this.roundService.toCents(eventPayload['amount']),
            currency: eventPayload['currency']
        };
    }

    public handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        const transactionType = this.isDebit(event) ? TransactionType.DEBIT : TransactionType.CREDIT;
        const transaction = this.createTransactionOfType(transactionType, event);
        return this.projection.addNew(transaction, connection);
    }

    public handleClear(connection: Queryable): Promise<void> {
        return this.projection.clear(connection);
    }

}
