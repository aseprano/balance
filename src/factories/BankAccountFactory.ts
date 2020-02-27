import { BankAccount } from "../entities/BankAccount";
import { BankAccountImpl } from "../entities/impl/BankAccountImpl";
import { Provider } from "../lib/Provider";
import { AccountID } from "../values/AccountID";

export class BankAccountFactory {

    constructor(private idGenerator: Provider<AccountID>) {}

    private generateAccountId(): AccountID {
        return this.idGenerator();
    }

    createInitialized(): BankAccount {
        const newAccount = new BankAccountImpl();
        newAccount.initialize(this.generateAccountId());
        return newAccount;
    }

}