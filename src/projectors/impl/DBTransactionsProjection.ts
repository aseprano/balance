import { TransactionsProjection, Transaction, TransactionType} from "../TransactionsProjection";
import { Queryable } from "../../tech/db/Queryable";
import { MoneyRoundService } from "../../domain/domain-services/MoneyRoundService";

export class DBTransactionProjection implements TransactionsProjection {

    addNew(transaction: Transaction, connection: Queryable): Promise<void> {
        console.log(`* Creating new ${transaction.amountInCents} ${transaction.currency}/cents ${transaction.type} transaction`);

        return connection.query(
            `INSERT INTO transactions (account_id, type, amount, currency, date, month) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                transaction.accountId,
                transaction.type as string,
                transaction.amountInCents,
                transaction.currency,
                transaction.date,
                transaction.date.substr(0, 7)
            ]
        ).then((ret) => ret.numberOfAffectedRows ? undefined : Promise.reject(new Error('Cannot insert new transaction')));
    }

    clear(connection: Queryable): Promise<void> {
        return connection.query('TRUNCATE TABLE transactions')
            .then(() => undefined);
    }
    
}