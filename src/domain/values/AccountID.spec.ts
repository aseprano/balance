import { AccountID } from "./AccountID"
import { InvalidAccountIDException } from "../exceptions/InvalidAccountIDException";

describe('AccountID', () => {
    
    it('cannot be an empty string', () => {
        expect(() => {
            new AccountID('')
        }).toThrow(new InvalidAccountIDException());
    });

    it('can be made of 11 digits', () => {
        const accountId = new AccountID('12345678901');
        expect(accountId.asString()).toBe('12345678901');
    });

    it('cannot be shorter than 11 digits', () => {
        expect(() => {
            new AccountID('1234567890');
        }).toThrow(new InvalidAccountIDException());
    });

    it('cannot be longer than 11 digits', () => {
        expect(() => {
            new AccountID('123456789011');
        }).toThrow(new InvalidAccountIDException());
    });

    it('cannot contain non digit characters', () => {
        expect(() => {
            new AccountID('1234567a r!');
        }).toThrow(new InvalidAccountIDException());
    });

    it('cannot start or end with a space', () => {
        expect(() => {
            new AccountID(' 12345678901');
        }).toThrow(new InvalidAccountIDException());

        expect(() => {
            new AccountID('12345678901 ');
        }).toThrow(new InvalidAccountIDException());
    });

})