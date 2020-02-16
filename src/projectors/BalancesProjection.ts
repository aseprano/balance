import { Queryable } from "../tech/db/Queryable";

export interface BalancesProjection {

    createBalance(accountId: string, currency: string, balance?: number): Promise<void>;

    updateBalance(accountId: string, currency: string, delta: number): Promise<void>;

    clear(): Promise<void>;

}