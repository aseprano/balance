import { TransactionsProjection, Transaction, TransactionType} from "../TransactionsProjection";
import { Queryable } from "../../tech/db/Queryable";


export class DBTransactionProjection implements TransactionsProjection {

    addNew(transaction: Transaction, connection: Queryable): Promise<void> {
        const amount = Math.floor(transaction.amount*100);

        return connection.query(
            `INSERT INTO transactions (account_id, type, amount, currency, date, month) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                transaction.accountId,
                transaction.type as string,
                amount,
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