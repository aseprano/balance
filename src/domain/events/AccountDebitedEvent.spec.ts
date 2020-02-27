import { AccountID } from "../values/AccountID";
import { AccountDebitedEvent } from "../events/AccountDebitedEvent";
import { Money } from "../values/Money";

describe('AccountDebitedEvent', () => {
    const fakeAccountId = new AccountID('12345612345');

    it('has the expected name and payload', () => {
        const event = new AccountDebitedEvent(fakeAccountId, new Money(3.12, 'USD'));

        expect(event.getName()).toBe(AccountDebitedEvent.EventName);
        expect(event.getPayload()).toEqual({
            id: fakeAccountId.asString(),
            debit: {
                amount: 3.12,
                currency: 'USD'
            }
        });
    });

});
