import { AccountCreatedEvent } from "./AccountCreatedEvent";
import { AccountID } from "../values/AccountID";

describe('AccountCreatedEvent', () => {
    it('has the right event name', () => {
        const event = new AccountCreatedEvent(new AccountID('12345678901'));
        expect(event.getName()).toEqual(AccountCreatedEvent.EventName);
    });

    it('has the expected payload', () => {
        const event = new AccountCreatedEvent(new AccountID('12345678901'));

        expect(event.getPayload()).toEqual({
            id: '12345678901'
        });
    });

})