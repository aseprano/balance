import { BankAccountImpl } from "./BankAccountImpl";
import { AccountID } from "../../values/AccountID";
import { AccountCreatedEvent } from "../../events/AccountCreatedEvent";
import { Money } from "../../values/Money";
import { AccountCreditedEvent } from "../../events/AccountCreditedEvent";
import { AccountDebitedEvent } from "../../events/AccountDebitedEvent";
import { EventStream } from "../../../tech/events/EventStream";
import { Snapshot } from "../../../tech/Snapshot";
import { AccountHolderName } from "../../values/AccountHolderName";

describe('BankAccountImpl', () => {

    const testId = new AccountID('12332100012');

    it('can be initalized with an account id and an owner', () => {
        const account = new BankAccountImpl();
        account.initialize(testId, new AccountHolderName("Emmet, Dr. Brown"));

        expect(account.getId())
            .toEqual(testId);

        expect(account.commitEvents())
            .toEqual([
                new AccountCreatedEvent(testId, new AccountHolderName("Emmet, Dr. Brown"))
            ]);
    });

    it('can be reconstructed from events', () => {
        const account = new BankAccountImpl();
        account.restoreFromEventStream({
            version: 10,
            events: [
                new AccountCreatedEvent(testId, new AccountHolderName("Marty McFly")),
                new AccountCreditedEvent(testId, new Money(10, 'EUR')),
                new AccountDebitedEvent(testId,  new Money(3.14, 'EUR')),
                new AccountDebitedEvent(testId,  new Money(5.87, 'EUR')),
            ]
        });

        expect(account.getId()).toEqual(testId);
        expect(account.getVersion()).toEqual(10);
        expect(account.getBalance('EUR')).toEqual(0.99);
    });

    it('increases the version after committing the events', () => {
        const account = new BankAccountImpl();

        account.restoreFromEventStream({
            version: 10,
            events: [
                new AccountCreatedEvent(testId, new AccountHolderName("George McFly")),
                new AccountCreditedEvent(testId, new Money(10, 'EUR')),
                new AccountDebitedEvent(testId,  new Money(3.14, 'EUR')),
                new AccountDebitedEvent(testId,  new Money(5.87, 'EUR')),
            ]
        });
        
        account.debit(new Money(0.95, 'EUR'));
        account.commitEvents();

        expect(account.getVersion()).toEqual(11);
        expect(account.getBalance('EUR')).toEqual(0.04);
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
                new AccountCreatedEvent(testId, new AccountHolderName("Biff Tannem"))
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
                new AccountCreatedEvent(testId, new AccountHolderName("Stanford S. Strickland")),
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
                new AccountCreatedEvent(testId, new AccountHolderName("Lorraine")),
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
        account.initialize(testId, new AccountHolderName("Calvin Klein"));
        account.credit(new Money(100, 'EUR'));

        account.commitEvents();
        expect(account.commitEvents()).toEqual([]);
    });

    it('returns the snapshot', () => {
        const accountId = new AccountID('12312312312');

        const events = [
            new AccountCreatedEvent(accountId, new AccountHolderName("Clint Eastwood")),
            new AccountCreditedEvent(accountId, new Money(10, 'EUR')),
            new AccountCreditedEvent(accountId, new Money(3.14, 'EUR')),
            new AccountDebitedEvent(accountId, new Money(1, 'EUR')),
            new AccountCreditedEvent(accountId, new Money(11.11, 'USD')),
            new AccountCreditedEvent(accountId, new Money(1, 'USD')),
            new AccountDebitedEvent(accountId, new Money(0.5, 'USD')),
        ];

        const stream: EventStream = {
            events,
            version: 3
        };

        const account = new BankAccountImpl();
        account.restoreFromEventStream(stream);

        const snapshot = account.getSnapshot();
        
        expect(snapshot).toEqual({
            version: 3,
            state: {
                entityId: accountId.asString(),
                balances: [
                    { amount: 12.14, currency: 'EUR' },
                    { amount: 11.61, currency: 'USD' },
                ]
            }
        } as Snapshot);
    });

    it('can be restored from a snapshot', () => {
        const snapshot: Snapshot = {
            version: 100,
            state: {
                entityId: '12312312312',
                balances: [
                    { currency: 'EUR', amount: 100 },
                    { currency: 'USD', amount: 3.14 },
                ]
            }
        }

        const account = new BankAccountImpl();
        account.restoreFromEventStream({ version: -1, events: [] }, snapshot);

        expect(account.getId()).toEqual(new AccountID('12312312312'));
        expect(account.getBalance('EUR')).toEqual(100);
        expect(account.getBalance('USD')).toEqual(3.14);
        expect(account.getVersion()).toEqual(100);
    });
    
});
