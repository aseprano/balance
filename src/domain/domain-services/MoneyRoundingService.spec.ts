import { MoneyRoundingService } from "./MoneyRoundingService";

describe('MoneyRoundingService', () => {
    const roundingService = new MoneyRoundingService();

    it('rounds the zero', () => {
        expect(roundingService.toCents(0.00)).toBeCloseTo(0, 0);
    });

    it('rounds an int', () => {
        expect(roundingService.toCents(1)).toBeCloseTo(100, 0);
    });

    it('rounds a two digits value', () => {
        expect(roundingService.toCents(10.23)).toBeCloseTo(1023, 0);
    });

    it('rounds a periodic number', () => {
        expect(roundingService.toCents(0.33)).toBeCloseTo(33, 0);
    });

    it('truncates extra decimals', () => {
        expect(roundingService.toCents(3.1415)).toBeCloseTo(314, 0);
    });

    it('does not round up', () => {
        expect(roundingService.toCents(0.99)).toBeCloseTo(99, 0);
    });

    it('rounds negative numbers as well', () => {
        expect(roundingService.toCents(-0.01)).toBeCloseTo(-1, 0);
    });

    it('rounds negative numbers as well #2', () => {
        expect(roundingService.toCents(-2.22)).toBeCloseTo(-222, 0);
    });

});
