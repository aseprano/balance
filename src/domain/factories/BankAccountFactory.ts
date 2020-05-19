import { BankAccount } from "../entities/BankAccount";
import { BankAccountImpl } from "../entities/impl/BankAccountImpl";
import { Provider } from "../../lib/Provider";
import { AccountID } from "../values/AccountID";
import { AccountHolderName } from "../values/AccountHolderName";

export class BankAccountFactory {

    constructor(private idGenerator: Provider<AccountID>) {}

    private generateAccountId(): AccountID {
        return this.idGenerator();
    }

    createInitialized(owner: AccountHolderName): BankAccount {
        const newAccount = new BankAccountImpl();
        newAccount.initialize(this.generateAccountId(), owner);
        return newAccount;
    }

}