import { TransactionsProjection, Transaction } from "../TransactionsProjection";
import { Queryable } from "../../../tech/db/Queryable";

export class DBTransactionProjection implements TransactionsProjection {

    addNew(transaction: Transaction, connection: Queryable): Promise<void> {
        return connection.query(
            `INSERT INTO transactions (account_id, type, amount, currency, date, month) VALUES (:accountId, :type, :amount, :currency, :date, :month)`,
            {
                accountId: transaction.accountId,
                type: transaction.type as string,
                amount: transaction.amountInCents,
                currency: transaction.currency,
                date: transaction.date,
                month: transaction.date.substr(0, 7)
            }
        ).then((ret) => {
            return ret.numberOfAffectedRows ?
                undefined :
                Promise.reject(new Error('Cannot insert new transaction'))
        });
    }

    clear(connection: Queryable): Promise<void> {
        return connection.query('TRUNCATE TABLE transactions')
            .then(() => undefined);
    }
    
}
