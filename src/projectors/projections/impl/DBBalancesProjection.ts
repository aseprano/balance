import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../../tech/db/Queryable";

export class DBBalancesProjection implements BalancesProjection {

    constructor() {}

    private createAccount(connection: Queryable, accountId: string, owner: string): Promise<void> {
        const sql = `INSERT INTO accounts VALUES (:accountId, :owner) ON DUPLICATE KEY UPDATE owner = VALUES(owner)`;

        return connection.query(sql, { accountId, owner })
            .then(() => undefined);
    }

    async createBalance(connection: Queryable, accountId: string, accountOwner: string, currency: string, balanceAsCents: number): Promise<void> {
        const sql = `INSERT INTO balances (account_id, currency, balance)
        VALUES (:accountId, :currency, :balance)
        ON DUPLICATE KEY UPDATE
            balance = balance + VALUES(balance)`;

        return this.createAccount(connection, accountId, accountOwner)
            .then(() => connection.query(
                sql,
                {
                    accountId,
                    currency,
                    balance: balanceAsCents
                }
            ))
            .then(() => undefined);
    }
    
    async updateBalance(connection: Queryable, accountId: string, currency: string, deltaAsCents: number): Promise<void> {
        const sql = `UPDATE balances SET balance = balance + :amount WHERE account_id = :accountId AND currency = :currency`;

        return connection.query(
            sql,
            {
                amount: deltaAsCents,
                accountId,
                currency
            }
        ).then((res: QueryResult) => {
            if (!res.numberOfAffectedRows) {
                return this.createBalance(connection, accountId, '', currency, deltaAsCents);
            }
        });

    }

    async clear(connection: Queryable): Promise<void> {
        return connection.query('TRUNCATE TABLE balances')
            .then(() => undefined);
    }

}