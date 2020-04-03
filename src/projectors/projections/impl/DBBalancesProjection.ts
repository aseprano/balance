import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../../tech/db/Queryable";

export class DBBalancesProjection implements BalancesProjection {

    constructor() {}

    private createAccount(connection: Queryable, accountId: string): Promise<void> {
        return connection.query('INSERT IGNORE INTO accounts VALUES (?)', [accountId])
            .then(() => undefined);
    }

    async createBalance(connection: Queryable, accountId: string, currency: string, balanceInCents: number): Promise<void> {
        const sql = '' + 
        'INSERT INTO balances (account_id, currency, balance) ' +
        'VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE balance = balance + ?';

        return this.createAccount(connection, accountId)
            .then(() => connection.query(
                sql,
                [accountId, currency, balanceInCents, balanceInCents]
            ))
            .then(() => undefined);
    }
    
    async updateBalance(connection: Queryable, accountId: string, currency: string, deltaInCents: number): Promise<void> {
        console.debug(`* Updating balance by ${deltaInCents} ${currency}/cents`);

        const sql = '' +
        'UPDATE balances ' +
        'SET balance = balance + ? ' +
        'WHERE account_id = ? ' +
        'AND currency = ?';

        return connection.query(
            sql,
            [deltaInCents, accountId, currency]
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