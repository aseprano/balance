import { mock, instance, when, anything } from "ts-mockito";
import { BankAccountImpl } from "../../entities/impl/BankAccountImpl";
import { BankAccountsRepositoryImpl } from "../../repositories/impl/BankAccountsRepositoryImpl";
import { AccountServiceImpl } from "./AccountServiceImpl";
import { NoRetryPolicy } from "../../tech/impl/NoRetryPolicy";
import { AccountID } from "../../values/AccountID";
import { AccountCreatedEvent } from "../../events/AccountCreatedEvent";
import { BankAccountFactory } from "../../factories/BankAccountFactory";
import { BankAccount } from "../../entities/BankAccount";
import { Money } from "../../values/Money";
import { InsufficientFundsException } from "../../exceptions/InsufficientFundsException";
import { BankAccountNotFoundException } from "../../exceptions/BankAccountNotFoundException";

describe('AccountServiceImpl', () => {
    const noRetryPolicy = new NoRetryPolicy<any>();

    function createAccountWithId(accountId: AccountID): BankAccount {
        const fakeAccount = mock(BankAccountImpl);

        when(fakeAccount.getId())
            .thenReturn(accountId);

        return fakeAccount;
    }

    function createAccountWithInsufficientFunds(accountId: AccountID): BankAccount {
        const fakeAccount: BankAccount = createAccountWithId(accountId);

        when(fakeAccount.debit(anything()))
            .thenThrow(new InsufficientFundsException());

        return fakeAccount;
    }

    function createFactoryThatReturns(bankAccount: BankAccount): BankAccountFactory {
        const fakeFactory = mock(BankAccountFactory);

        when(fakeFactory.createInitialized())
            .thenReturn(bankAccount);

        return fakeFactory;
    }

    it('creates new account using the factory', (done) => {
        const fakeAccount = createAccountWithId(new AccountID('12312312312'));
        
        when(fakeAccount.commitEvents())
            .thenReturn([
                new AccountCreatedEvent(new AccountID('12312312312')),
            ]);

        const account = instance(fakeAccount);
        
        const fakeFactory = mock(BankAccountFactory);
        const accountFactory = instance(fakeFactory);
        spyOn(accountFactory, 'createInitialized').and.returnValue(account);

        const fakeRepo = mock(BankAccountsRepositoryImpl);
        when(fakeRepo.add(account))
            .thenResolve();

        const repo = instance(fakeRepo);

        const service = new AccountServiceImpl(
            repo,
            accountFactory,
            noRetryPolicy
        );

        service.newAccount()
            .then(newId => {
                expect(accountFactory.createInitialized).toHaveBeenCalledTimes(1);
                expect(newId).toEqual(new AccountID('12312312312'));
                done();
            });
    });

    it('throws an error if cannot debit the account', async () => {
        const fakeAccount = createAccountWithInsufficientFunds(new AccountID('12312312312'));

        const fakeRepository = mock(BankAccountsRepositoryImpl);
        when(fakeRepository.getById(anything()))
            .thenResolve(instance(fakeAccount));

        const service = new AccountServiceImpl(
            instance(fakeRepository),
            createFactoryThatReturns(instance(fakeAccount)),
            noRetryPolicy
        );

        await expectAsync(service.debit(new Money(0.01, 'EUR'), new AccountID('12312312312')))
            .toBeRejected();
    });

});
