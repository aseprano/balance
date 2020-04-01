import { BalancesProjection } from "../BalancesProjection";
import { Queryable, QueryResult } from "../../tech/db/Queryable";
import { MoneyRoundService } from "../../domain/domain-services/MoneyRoundService";

export class DBBalancesProjection implements BalancesProjection {

    constructor(private roundService: MoneyRoundService) {}

    private createAccount(connection: Queryable, accountId: string): Promise<void> {
        return connection.query('INSERT IGNORE INTO accounts VALUES (?)', [accountId])
            .then(() => undefined);
    }

    async createBalance(connection: Queryable, accountId: string, currency: string, balance: number): Promise<void> {
        balance = fixBalance(balance);

        const sql = '' + 
        'INSERT INTO balances (account_id, currency, balance) ' +
        'VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE balance = balance + ?';

        return this.createAccount(connection, accountId)
            .then(() => connection.query(
                sql,
                [accountId, currency, balance, balance]
            ))
            .then(() => undefined);
    }
    
    async updateBalance(connection: Queryable, accountId: string, currency: string, delta: number): Promise<void> {
        delta = this.roundService.toCents(delta);
        
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