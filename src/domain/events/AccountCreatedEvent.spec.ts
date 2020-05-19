import { AccountCreatedEvent } from "./AccountCreatedEvent";
import { AccountID } from "../values/AccountID";
import { AccountHolderName } from "../values/AccountHolderName";

describe('AccountCreatedEvent', () => {

    it('has the right event name', () => {
        const event = new AccountCreatedEvent(new AccountID('12345678901'), new AccountHolderName("Emmet, Dr. Brown"));
        expect(event.getName()).toEqual(AccountCreatedEvent.EventName);
    });

    it('has the expected payload', () => {
        const event = new AccountCreatedEvent(new AccountID('12345678901'), new AccountHolderName("Emmet, Dr. Brown"));

        expect(event.getPayload()).toEqual({
            id: '12345678901',
            owner: "Emmet, Dr. Brown",
        });
    });

})