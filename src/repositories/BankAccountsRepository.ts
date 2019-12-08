import { AccountID } from "../values/AccountID";
import { BankAccount } from "../entities/BankAccount";

export interface BankAccountsRepository {

    getById(id: AccountID): Promise<BankAccount>;

    add(account: BankAccount): Promise<void>;

    /**
     * Updates a bank account.
     * Returns a BankAccountNotFoundException if the provided account doesn't exist
     * 
     * @param account
     */
    update(account: BankAccount): Promise<void>;

}