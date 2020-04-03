import { Queryable } from "../../tech/db/Queryable";

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}

export type Transaction = {
    accountId: string,
    type: TransactionType,
    date: string,
    amountInCents: number,
    currency: string
}

export interface TransactionsProjection {
    addNew(transaction: Transaction, connection: Queryable): Promise<void>;
    clear(connection: Queryable): Promise<void>;
}
