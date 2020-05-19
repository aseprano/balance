import { Queryable } from "../../tech/db/Queryable";

export interface BalancesProjection {

    createBalance(
        connection: Queryable,
        accountId: string,
        accountOwner: string,
        currency: string,
        balance?: number
    ): Promise<void>;

    updateBalance(connection: Queryable, accountId: string, currency: string, delta: number): Promise<void>;

    clear(connection: Queryable): Promise<void>;

}