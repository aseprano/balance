import { Money } from "./Money";

describe('Money', () => {
    
    it('can have a value of zero', () => {
        const money = new Money(0, "EUR");
        expect(money.getAmount()).toBeCloseTo(0, 0);
        expect(money.getCurrency()).toBe("EUR");
    });

    it('can be a positive number', () => {
        const money = new Money(3.14, "EUR");
        expect(money.getAmount()).toBeCloseTo(3.14, 0);
        expect(money.getCurrency()).toBe("EUR");
    });

    it('cannot be negative', () => {
        expect(() => {
            new Money(-1, 'EUR');
        }).toThrow();
    });

    it('preserves the currency case', () => {
        const money = new Money(3, 'usd');
        expect(money.getCurrency()).toBe('usd');
    });

})