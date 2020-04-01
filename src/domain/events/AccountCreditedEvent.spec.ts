import { AccountCreditedEvent } from "../events/AccountCreditedEvent";
import { AccountID } from "../values/AccountID";
import { Money } from "../values/Money";

describe('AccountCreditedEvent', () => {
    const fakeAccountId = new AccountID('12312312312');

    it('has the expected name and payload', () => {
        const event = new AccountCreditedEvent(fakeAccountId, new Money(3, 'EUR'));
        expect(event.getName()).toEqual(AccountCreditedEvent.EventName);
        expect(event.getPayload()).toEqual({
            id: fakeAccountId.asString(),
            amount: 3,
            currency: 'EUR',
        })
    });
    
});
