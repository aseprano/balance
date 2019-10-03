import { BankAccountFactory } from "./BankAccountFactory";
import { AccountID } from "../values/AccountID";
import { BankAccountImpl } from "../entities/impl/BankAccountImpl";
import { AccountCreatedEvent } from "../events/AccountCreatedEvent";

describe('BankAccountFactory', () => {

    it('creates an initalized BankAccout', () => {
        const factory = new BankAccountFactory(() => new AccountID('11122233344'));
        const account = factory.createInitialized();
        expect(account.getId().asString()).toEqual('11122233344');
        expect(account.commitEvents()).toEqual([
            new AccountCreatedEvent(new AccountID('11122233344'))
        ]);
    });
    
})