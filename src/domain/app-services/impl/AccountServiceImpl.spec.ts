import { mock, instance, when, anything } from "ts-mockito";
import { BankAccountImpl } from "../../entities/impl/BankAccountImpl";
import { BankAccountsRepositoryImpl } from "../../repositories/impl/BankAccountsRepositoryImpl";
import { AccountServiceImpl } from "./AccountServiceImpl";
import { NoRetryPolicy } from "../../../tech/impl/NoRetryPolicy";
import { AccountID } from "../../values/AccountID";
import { AccountCreatedEvent } from "../../events/AccountCreatedEvent";
import { BankAccountFactory } from "../../factories/BankAccountFactory";
import { BankAccount } from "../../entities/BankAccount";
import { Money } from "../../values/Money";
import { InsufficientFundsException } from "../../exceptions/InsufficientFundsException";
import { RetryPolicy } from "../../../tech/RetryPolicy";
import { AccountHolderName } from "../../values/AccountHolderName";

describe('AccountServiceImpl', () => {
    const noRetryPolicy = new NoRetryPolicy<any>();
    const accountHolder = new AccountHolderName("Brown, Dr. Emmet");

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

    function createAccountWithEnoughFunds(accountId: AccountID): BankAccount {
        const fakeAccount: BankAccount = createAccountWithId(accountId);

        when(fakeAccount.debit(anything()))
            .thenResolve();

        return fakeAccount;
    }

    function createFactoryThatReturns(bankAccount: BankAccount): BankAccountFactory {
        const fakeFactory = mock(BankAccountFactory);

        when(fakeFactory.createInitialized(new AccountHolderName("George Lucas")))
            .thenReturn(bankAccount);

        return fakeFactory;
    }

    it('creates new account using the factory', (done) => {
        const fakeAccount = createAccountWithId(new AccountID('12312312312'));
        
        when(fakeAccount.commitEvents())
            .thenReturn([
                new AccountCreatedEvent(new AccountID('12312312312'), new AccountHolderName("George Lucas")),
            ]);

        const account = instance(fakeAccount);
        
        const fakeFactory = mock(BankAccountFactory);
        const accountFactory = instance(fakeFactory);
        spyOn(accountFactory, 'createInitialized').and.returnValue(account);

        const fakeRepo = mock(BankAccountsRepositoryImpl);
        when(fakeRepo.save(account))
            .thenResolve();

        const repo = instance(fakeRepo);

        const service = new AccountServiceImpl(
            repo,
            accountFactory,
            noRetryPolicy
        );

        service.newAccount(accountHolder)
            .then((newId) => {
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

    it('debits the account through the retryPolicy', (done) => {
        const fakeAccount = createAccountWithInsufficientFunds(new AccountID('12312312312'));

        const fakeRepo = mock(BankAccountsRepositoryImpl);
        when(fakeRepo.getById(anything())).thenResolve(instance(fakeAccount));

        let policyInvoked = false;

        const service = new AccountServiceImpl(
            instance(fakeRepo),
            createFactoryThatReturns(instance(fakeAccount)),
            new (class FakePolicy implements RetryPolicy<any> {
                retry(f: () => Promise<any>): Promise<any> {
                    policyInvoked = true;
                    return f();
                }
            })()
        );

        service.debit(new Money(0.01, 'EUR'), new AccountID('12312312312'))
            .catch(() => {
                expect(policyInvoked).toEqual(true);
                done();
            });
    });

    it('debits the account if the balance is enough', (done) => {
        const fakeAccount = createAccountWithEnoughFunds(new AccountID('12312312312'));

        let updateInvoked = false;

        const fakeRepo = mock(BankAccountsRepositoryImpl);

        when(fakeRepo.getById(anything()))
            .thenResolve(instance(fakeAccount));

        when(fakeRepo.save(anything()))
            .thenCall(() => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        updateInvoked = true;
                        resolve();
                    }, 1000);
                });
            });

        const service = new AccountServiceImpl(
            instance(fakeRepo),
            createFactoryThatReturns(instance(fakeAccount)),
            noRetryPolicy
        );

        service.debit(new Money(0.01, 'EUR'), new AccountID('12312312312'))
            .then(() => {
                expect(updateInvoked).toEqual(true);
                done();
            });
    });

    it('persists the debited account to the repository', async (done) => {
        let accountDebited = false;

        const fakeAccount = createAccountWithId(new AccountID('12312312312'));
        when(fakeAccount.debit(anything()))
            .thenCall(() => {
                accountDebited = true;
            });

        const fakeRepo = mock(BankAccountsRepositoryImpl);

        when(fakeRepo.getById(anything()))
            .thenResolve(instance(fakeAccount));
        
        when(fakeRepo.save(instance(fakeAccount)))
            .thenCall(() => {
                expect(accountDebited).toEqual(true);
                done();
                return Promise.resolve();
            });

        const service = new AccountServiceImpl(
            instance(fakeRepo),
            createFactoryThatReturns(instance(fakeAccount)),
            noRetryPolicy
        );

        service.debit(new Money(0.01, 'EUR'), new AccountID('12312312312'));
    });

    it('credits and updates the account', async () => {
        const amountToCredit = new Money(112.00, 'EUR');
        const accountId = new AccountID('12312312312');
        
        let accountCredited = false;
        let accountUpdated = false;

        const fakeAccount = createAccountWithId(accountId);
        when(fakeAccount.credit(amountToCredit))
            .thenCall(() => {
                accountCredited = true;
            });
        
        const fakeRepo = mock(BankAccountsRepositoryImpl);
        when(fakeRepo.getById(accountId))
            .thenResolve(instance(fakeAccount));

        when(fakeRepo.save(instance(fakeAccount)))
            .thenReturn(new Promise((resolve, reject) => {
                setTimeout(() => {
                    accountUpdated = true;
                    resolve();
                }, 1000);
            }));

        const service = new AccountServiceImpl(
            instance(fakeRepo),
            createFactoryThatReturns(instance(fakeAccount)),
            noRetryPolicy
        );

        await service.credit(amountToCredit, accountId);
        expect(accountCredited).toEqual(true);
        expect(accountUpdated).toEqual(true);
    });

    it('credits the account through the retry policy', async () => {
        let policyInvoked = false;

        const fakeAccount = createAccountWithId(new AccountID('12312312312'));
        when(fakeAccount.credit(anything()))
            .thenReturn();

        const fakeRepo = mock(BankAccountsRepositoryImpl);
        when(fakeRepo.getById(anything()))
            .thenResolve(instance(fakeAccount));

        const service = new AccountServiceImpl(
            instance(fakeRepo),
            createFactoryThatReturns(instance(fakeAccount)),
            new (class FakePolicy implements RetryPolicy<any> {
                retry(f: () => Promise<any>): Promise<any> {
                    policyInvoked = true;
                    return f();
                }
            })()
        );

        await service.credit(new Money(3.14, 'EUR'), new AccountID('12312312312'));
        expect(policyInvoked).toEqual(true);
    });

});
