import { BadMoneyException } from "../exceptions/BadMoneyException";

export class Money {

    constructor(private amount: number, private currency: string) {
        if (amount === undefined || amount < 0 || currency === undefined) {
            throw new BadMoneyException('Invalid Money value');
        }
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }
    
}