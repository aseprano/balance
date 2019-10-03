import { AccountID } from "../values/AccountID";
import { BankAccount } from "../entities/BankAccount";

export interface BankAccountsRepository {

    getById(id: AccountID): Promise<BankAccount>;

    add(account: BankAccount): Promise<void>;

    update(account: BankAccount): Promise<void>;

}