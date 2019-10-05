import { BankAccountImpl } from "./BankAccountImpl";
import { AccountID } from "../../values/AccountID";
import { AccountCreatedEvent } from "../../events/AccountCreatedEvent";
import { Money } from "../../values/Money";
import { AccountCreditedEvent } from "../../events/AccountCreditedEvent";
import { AccountDebitedEvent } from "../../events/AccountDebitedEvent";

describe('BankAccountImpl', () => {

    const testId = new AccountID('12332100012');

    it('can be initalized with an account id', () => {
        const account = new BankAccountImpl();
        account.initialize(testId);

        expect(account.getId())
            .toEqual(testId);

        expect(account.commitEvents())
            .toEqual([
                new AccountCreatedEvent(testId)
            ]);
    });

    it('can be reconstructed from events', () => {
        const account = new BankAccountImpl();
        account.restoreFromEventStream({
            version: 10,
            events: [
                new AccountCreatedEvent(testId),
                new AccountCreditedEvent(testId, new Money(1000, 'EUR')),
                new AccountCreditedEvent(testId, new Money(750, 'USD')),
                new AccountDebitedEvent(testId, new Money(200, 'EUR')),
                new AccountDebitedEvent(testId, new Money(0.8, 'USD')),
            ]
        });

        expect(account.getId()).toEqual(testId);
        expect(account.getBalance('EUR')).toBeCloseTo(800, 0);
        expect(account.getBalance('USD')).toBeCloseTo(749.2, 0);
        expect(account.getVersion()).toEqual(10);
    });

    it('has a balance of zero after initialization', () => {
        const account = new BankAccountImpl();
        expect(account.getBalance('EUR')).toEqual(0);
        expect(account.getBalance('USD')).toEqual(0);
    });

    it('can be credited', () => {
        const account = new BankAccountImpl();
        account.restoreFromEventStream({
            version: 10,
            events: [
                new AccountCreatedEvent(testId)
            ]
        });

        account.credit(new Money(3.14, 'EUR'));

        expect(account.getBalance('EUR')).toBeCloseTo(3.14, 0);
        expect(account.getBalance('USD')).toEqual(0);
        expect(account.commitEvents()).toEqual([
            new AccountCreditedEvent(testId, new Money(3.14, 'EUR'))
        ]);
    });

    it('can be debited when balance is enough', () => {
        const account = new BankAccountImpl();
        account.restoreFromEventStream({
            version: 10,
            events: [
                new AccountCreatedEvent(testId),
                new AccountCreditedEvent(testId, new Money(1000, 'EUR'))
            ]
        });

        account.debit(new Money(100.12, 'EUR'));
        expect(account.getBalance('EUR')).toBeCloseTo(899.88, 0);
        expect(account.commitEvents()).toEqual([
            new AccountDebitedEvent(testId, new Money(100.12, 'EUR'))
        ]);
    });

    it('cannot be debited it balance is not enough', () => {
        const account = new BankAccountImpl();
        account.restoreFromEventStream({
            version: 10,
            events: [
                new AccountCreatedEvent(testId),
                new AccountCreditedEvent(testId, new Money(1000, 'EUR')),
            ]
        });

        expect(() => {
            account.debit(new Money(1000.01, 'EUR'));
        }).toThrow();

        expect(account.getBalance('EUR')).toBeCloseTo(1000, 0);
        expect(account.commitEvents()).toEqual([]);
    });

    it('clears the uncommitted events when commitEvents() is invoked', () => {
        const account = new BankAccountImpl();
        account.initialize(testId);
        account.credit(new Money(100, 'EUR'));

        account.commitEvents();
        expect(account.commitEvents()).toEqual([]);
    });

});
