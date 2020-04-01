export class MoneyRoundService {

    public toCents(amount: number): number {
        return Math.floor(amount*100);
    }
    
}