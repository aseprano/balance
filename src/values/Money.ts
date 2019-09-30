export class Money {

    constructor(private amount: number, private currency: string) {
        if (amount < 0) {
            throw new Error('Invalid Money value');
        }
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }
    
}