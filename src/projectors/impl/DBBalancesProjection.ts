import { BalancesProjection } from "../BalancesProjection";
import { DBConnectionProvider } from "../../tech/DBConnectionProvider";

export class DBBalancesProjection implements BalancesProjection {

    constructor(private connectionProvider: DBConnectionProvider) {}

    private async getConnection(): Promise<any> {
        return await this.connectionProvider.getDB();
    }

    async createBalance(accountId: string, currency: string, balance?: number): Promise<void> {
        const sql = '\
        INSERT INTO balances (account_id, currency, balance)\
        VALUES\
        (:accountId, :currency, :balance)\
        ON DUPLICATE KEY UPDATE balance = balance + :balance';

        return (await this.getConnection()).raw(
            sql,
            {
                accountId,
                currency,
                balance: balance || 0,
            }
        ).then(() => undefined);
    }
    
    async updateBalance(accountId: string, currency: string, delta: number): Promise<void> {
        const sql = '\
        UPDATE balances\
        SET balance = balance + :delta\
        WHERE account_id = :accountId\
        AND currency = :currency';

        return (await this.getConnection()).raw(
            sql,
            {
                accountId,
                currency,
                delta,
            }
        ).then((data: any) => {
            const affectedRows: number = data[0]['affectedRows'];

            if (affectedRows === 0) {
                return this.createBalance(accountId, currency, delta);
            }
        });

    }

}