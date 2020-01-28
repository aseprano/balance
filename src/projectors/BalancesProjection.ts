export interface BalancesProjection {

    createBalance(accountId: string, currency: string, balance?: number): Promise<void>;

    updateBalance(accountId: string, currency: string, delta: number): Promise<void>;

}