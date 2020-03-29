import { DBAbstractProjector } from "./DBAbstractProjector";
import { AccountCreditedEvent } from "../../domain/events/AccountCreditedEvent";
import { AccountDebitedEvent } from "../../domain/events/AccountDebitedEvent";
import { IncomingEvent } from "../../tech/impl/events/IncomingEvent";
import { Queryable } from "../../tech/db/Queryable";
import { TransactionsProjection, TransactionType, Transaction } from "../TransactionsProjection";

const projectorId = 'com.herrdoktor.projections.transactions';

export class TransactionProjector extends DBAbstractProjector {

    static get ID() {
        return projectorId;
    }

    constructor(private projection: TransactionsProjection) {
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

    private createDebitTransaction(event: IncomingEvent, ): Transaction {
        const eventPayload = event.getPayload();

        return {
            accountId: eventPayload['id'],
            type: TransactionType.DEBIT,
            date: event.getDateFired(),
            amount: eventPayload['debit']['amount'],
            currency: eventPayload['debit']['currency']
        }
    }

    private createCreditTransaction(event: IncomingEvent): Transaction {
        const eventPayload = event.getPayload();

        return {
            accountId: eventPayload['id'],
            type: TransactionType.CREDIT,
            date: event.getDateFired(),
            amount: eventPayload['credit']['amount'],
            currency: eventPayload['credit']['currency']
        }
    }

    public handleIncomingEvent(event: IncomingEvent, connection: Queryable): Promise<void> {
        const transaction = this.isDebit(event) ? this.createDebitTransaction(event) : this.createCreditTransaction(event);
        return this.projection.addNew(transaction, connection);
    }

    public handleClear(connection: Queryable): Promise<void> {
        return this.projection.clear(connection);
    }

}