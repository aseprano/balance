import { AccountID } from "../values/AccountID";
import { Money } from "../values/Money";
import { AccountHolderName } from "../values/AccountHolderName";

export interface AccountService {

    newAccount(owner: AccountHolderName): Promise<AccountID>;

    credit(money: Money, accountId: AccountID): Promise<void>;

    debit(money: Money, accountId: AccountID): Promise<void>;
    
}