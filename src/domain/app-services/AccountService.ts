import { AccountID } from "../values/AccountID";
import { Money } from "../values/Money";

export interface AccountService {

    newAccount(): Promise<AccountID>;

    credit(money: Money, accountId: AccountID): Promise<void>;

    debit(money: Money, accountId: AccountID): Promise<void>;
    
}