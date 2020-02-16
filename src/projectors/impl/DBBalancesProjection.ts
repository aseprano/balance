import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../tech/db/Queryable";

export class DBBalancesProjection implements BalancesProjection {

    constructor(private conn: Queryable) {}

    async createBalance(accountId: string, currency: string, balance: number): Promise<void> {
        const sql = '' + 
        'INSERT INTO balances (account_id, currency, balance) ' +
        'VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE balance = balance + ?';

        return this.conn.query(
            sql,
            [accountId, currency, balance, balance]
        ).then(() => undefined);
    }
    
    async updateBalance(accountId: string, currency: string, delta: number): Promise<void> {
        const sql = '' +
        'UPDATE balances ' +
        'SET balance = balance + ? ' +
        'WHERE account_id = ? ' +
        'AND currency = ?';

        return this.conn.query(
            sql,
            [delta, accountId, currency]
        ).then((res: QueryResult) => {
            if (!res.numberOfAffectedRows) {
                return this.createBalance(accountId, currency, delta);
            }
        });

    }

    async clear(): Promise<void> {
        return this.conn.query('TRUNCATE TABLE balances').then(() => undefined);
    }

}