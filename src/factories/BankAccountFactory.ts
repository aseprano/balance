import { BankAccount } from "../entities/BankAccount";
import { BankAccountImpl } from "../entities/impl/BankAccountImpl";
import { Provider } from "../Provider";
import { AccountID } from "../values/AccountID";

export class BankAccountFactory {

    constructor(private idGenerator: Provider<AccountID>) {}

    createInitialized(): BankAccount {
        const newAccountId = this.idGenerator();
        const newAccount = new BankAccountImpl();
        newAccount.initialize(newAccountId);
        return newAccount;
    }

}