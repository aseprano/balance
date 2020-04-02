import { AccountID } from "../values/AccountID";
import { BankAccount } from "../entities/BankAccount";

export interface BankAccountsRepository {

    getById(id: AccountID): Promise<BankAccount>;

    save(account: BankAccount): Promise<void>;

}