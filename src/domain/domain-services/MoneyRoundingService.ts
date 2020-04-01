export class MoneyRoundingService {

    public toCents(amount: number): number {
        if (amount < 0) {
            return -this.toCents(-amount);
        }
        
        return Math.floor(amount*100);
    }
    
}