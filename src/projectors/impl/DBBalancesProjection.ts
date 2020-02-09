import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../tech/db/Queryable";

export class DBBalancesProjection implements BalancesProjection {

    async createBalance(dbConnection: Queryable, accountId: string, currency: string, balance: number): Promise<void> {
        const sql = '' + 
        'INSERT INTO balances (account_id, currency, balance) ' +
        'VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE balance = balance + ?';

        return dbConnection.query(
            sql,
            [accountId, currency, balance, balance]
        ).then(() => undefined);
    }
    
    async updateBalance(dbConnection: Queryable, accountId: string, currency: string, delta: number): Promise<void> {
        const sql = '' +
        'UPDATE balances ' +
        'SET balance = balance + ? ' +
        'WHERE account_id = ? ' +
        'AND currency = ?';

        return dbConnection.query(
            sql,
            [delta, accountId, currency]
        ).then((res: QueryResult) => {
            if (!res.numberOfAffectedRows) {
                return this.createBalance(dbConnection, accountId, currency, delta);
            }
        });

    }

}