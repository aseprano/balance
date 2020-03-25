import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../tech/db/Queryable";

function fixBalance(balance: number): number {
    return Math.floor(balance*100);
}
export class DBBalancesProjection implements BalancesProjection {

    async createBalance(connection: Queryable, accountId: string, currency: string, balance: number): Promise<void> {
        balance = fixBalance(balance);

        const sql = '' + 
        'INSERT INTO balances (account_id, currency, balance) ' +
        'VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE balance = balance + ?';

        return connection.query(
            sql,
            [accountId, currency, balance, balance]
        ).then(() => undefined);
    }
    
    async updateBalance(connection: Queryable, accountId: string, currency: string, delta: number): Promise<void> {
        delta = fixBalance(delta);
        
        const sql = '' +
        'UPDATE balances ' +
        'SET balance = balance + ? ' +
        'WHERE account_id = ? ' +
        'AND currency = ?';

        return connection.query(
            sql,
            [delta, accountId, currency]
        ).then((res: QueryResult) => {
            if (!res.numberOfAffectedRows) {
                return this.createBalance(connection, accountId, currency, delta);
            }
        });

    }

    async clear(connection: Queryable): Promise<void> {
        return connection.query('TRUNCATE TABLE balances')
            .then(() => undefined);
    }

}