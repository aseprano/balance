import { Queryable } from "../tech/db/Queryable";

export interface BalancesProjection {

    createBalance(dbConnection: Queryable, accountId: string, currency: string, balance?: number): Promise<void>;

    updateBalance(dbConnection: Queryable, accountId: string, currency: string, delta: number): Promise<void>;

}