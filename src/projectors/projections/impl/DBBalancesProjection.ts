import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../../tech/db/Queryable";

export class DBBalancesProjection implements BalancesProjection {

    constructor() {}

    private createAccount(connection: Queryable, accountId: string): Promise<void> {
        const sql = `INSERT IGNORE INTO accounts VALUES (:accountId)`;

        return connection.query(sql, {accountId})
            .then(() => undefined);
    }

    async createBalance(connection: Queryable, accountId: string, currency: string, balanceInCents: number): Promise<void> {
        const sql = `INSERT INTO balances (account_id, currency, balance)
        VALUES (:accountId, :currency, :balance)
        ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)`;

        return this.createAccount(connection, accountId)
            .then(() => connection.query(
                sql,
                {
                    accountId,
                    currency,
                    balance: balanceInCents
                }
            ))
            .then(() => undefined);
    }
    
    async updateBalance(connection: Queryable, accountId: string, currency: string, deltaInCents: number): Promise<void> {
        const sql = `UPDATE balances SET balance = balance + :amount WHERE account_id = :accountId AND currency = :currency`;

        return connection.query(
            sql,
            {
                amount: deltaInCents,
                accountId,
                currency
            }
        ).then((res: QueryResult) => {
            if (!res.numberOfAffectedRows) {
                return this.createBalance(connection, accountId, currency, deltaInCents);
            }
        });

    }

    async clear(connection: Queryable): Promise<void> {
        return connection.query('TRUNCATE TABLE balances')
            .then(() => undefined);
    }

}