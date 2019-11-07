import { AccountService } from "../AccountService";
import { AccountID } from "../../values/AccountID";
import { Money } from "../../values/Money";
import { BankAccountsRepository } from "../../repositories/BankAccountsRepository";
import { BankAccountFactory } from "../../factories/BankAccountFactory";
import { RetryPolicy } from "../../tech/RetryPolicy";

export class AccountServiceImpl implements AccountService {

    constructor(
        private accountsRepository: BankAccountsRepository,
        private accountFactory: BankAccountFactory,
        private retryPolicy: RetryPolicy<any>
    ) { }

    private doRepeat(f: () => Promise<any>) {
        return this.retryPolicy.retry(f);
    }

    async newAccount(): Promise<AccountID> { 
        return this.doRepeat(() => {
            const newAccount = this.accountFactory.createInitialized();
        
            return this.accountsRepository
                .add(newAccount)
                .then(() => newAccount.getId());
        });
    }

    async credit(amount: Money, accountId: AccountID): Promise<void> {
        return this.doRepeat(async () => {
            const account = await this.accountsRepository.getById(accountId);
            account.credit(amount);
            await this.accountsRepository.update(account);
        });
    }

    async debit(amount: Money, accountId: AccountID): Promise<void> {
        return this.doRepeat(async () => {
            const account = await this.accountsRepository.getById(accountId);
            account.debit(amount);
            await this.accountsRepository.update(account);
        });
    }

}