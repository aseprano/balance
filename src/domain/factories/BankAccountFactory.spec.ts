import { BankAccountFactory } from "./BankAccountFactory";
import { AccountID } from "../values/AccountID";
import { AccountCreatedEvent } from "../events/AccountCreatedEvent";
import { AccountHolderName } from "../values/AccountHolderName";

describe('BankAccountFactory', () => {

    it('creates an initalized BankAccout', () => {
        const factory = new BankAccountFactory(() => new AccountID('11122233344'));
        const account = factory.createInitialized(new AccountHolderName("Don Vito Corleone"));
        expect(account.getId().asString()).toEqual('11122233344');
        expect(account.commitEvents()).toEqual([
            new AccountCreatedEvent(new AccountID('11122233344'), new AccountHolderName("Don Vito Corleone"))
        ]);
    });
    
})