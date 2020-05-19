import { mock, instance, when, anything, anyNumber, anyString } from "ts-mockito";
import { BankAccountsRepositoryImpl } from "./BankAccountsRepositoryImpl";
import { BankAccountImpl } from "../../entities/impl/BankAccountImpl";
import { FakeEventStore } from "../../../tech/impl/events/FakeEventStore";
import { AccountCreatedEvent } from "../../events/AccountCreatedEvent";
import { AccountID } from "../../values/AccountID";
import { AccountCreditedEvent } from "../../events/AccountCreditedEvent";
import { Money } from "../../values/Money";
import { BankAccountNotFoundException } from "../../exceptions/BankAccountNotFoundException";
import { DuplicatedBankAccountException } from "../../exceptions/DuplicatedBankAccountException";
import { AccountDebitedEvent } from "../../events/AccountDebitedEvent";
import { StreamConcurrencyException } from "../../../tech/exceptions/StreamConcurrencyException";
import { SnapshotRepositoryImpl } from "../../../tech/impl/SnapshotRepositoryImpl";
import { StreamNotFoundException } from "../../../tech/exceptions/StreamNotFoundException";
import { StreamAlreadyExistingException } from "../../../tech/exceptions/StreamAlreadyExistingException";
import { AccountHolderName } from "../../values/AccountHolderName";

function mockSnapshot() {
    return mock(SnapshotRepositoryImpl);
}

function createEmptySnapshotRepo() {
    const mockedRepo = mockSnapshot();

    when(mockedRepo.getById(anyString())).thenResolve(undefined);

    return mockedRepo;
}

describe('BankAccountsRepositoryImpl', () => {
    const emptySnapshotRepo = createEmptySnapshotRepo();

    it('raises a BankAccountNotFoundException if the relative stream is not found', (done) => {
        const fakeStore = new FakeEventStore(); // create an empty store

        const repo = new BankAccountsRepositoryImpl(
            fakeStore,
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        repo.getById(new AccountID('12312312312'))
            .catch(error => {
                expect(error instanceof BankAccountNotFoundException).toBeTruthy();
                done();
            });
    });

    it('uses the stream read from the EventStore to reconstitute the BankAccount', async () => {
        const fakeAccountId = new AccountID('12312312312');

        const accountEventStream = {
            version: 7,
            events: [
                new AccountCreatedEvent(fakeAccountId, new AccountHolderName("Robocop")),
                new AccountCreditedEvent(fakeAccountId, new Money(300, 'EUR')),
            ]
        };

        const fakeStore = new FakeEventStore();

        fakeStore.setStream(
            'bank-account-' + fakeAccountId.asString(),
            accountEventStream
        );

        const mockedAccount = mock(BankAccountImpl);
        const concreteAccount = instance(mockedAccount);
        spyOn(concreteAccount, 'restoreFromEventStream');

        const accountFactory = () => concreteAccount;
        const repo = new BankAccountsRepositoryImpl(fakeStore, instance(emptySnapshotRepo), accountFactory, 0);
        const account = await repo.getById(fakeAccountId);

        expect(account.restoreFromEventStream).toHaveBeenCalledWith(accountEventStream, undefined);
    });

    it('uses the uncommitted events to create a new stream when a new entity is stored', async () => {
        const accountId = new AccountID('12312312312');

        const entityEvents = [
            new AccountCreatedEvent(accountId, new AccountHolderName("Murphy")),
            new AccountCreditedEvent(accountId, new Money(27, 'USD')),
        ];

        const mockedAccount = mock(BankAccountImpl);
        when(mockedAccount.getVersion()).thenReturn(-1);
        when(mockedAccount.commitEvents()).thenReturn(entityEvents);
        when(mockedAccount.getId()).thenReturn(accountId);

        const fakeStore = new FakeEventStore();
        const repo = new BankAccountsRepositoryImpl(fakeStore, instance(emptySnapshotRepo),() => new BankAccountImpl(), 0);

        await repo.save(instance(mockedAccount));

        const eventsStream = await fakeStore.readStream('bank-account-12312312312');
        expect(eventsStream).toEqual({
            version: 1,
            events: entityEvents
        });
    });

    it('adds the uncommitted events to the EventStore when updating an account', (done) => {
        const accountId = new AccountID('12312312312');

        const accountUncommittedEvents = [
            new AccountCreditedEvent(accountId, new Money(30, 'USD')),
            new AccountDebitedEvent(accountId, new Money(25, 'USD')),
        ];

        const mockedAccount = mock(BankAccountImpl);
        when(mockedAccount.getId()).thenReturn(accountId);
        when(mockedAccount.commitEvents()).thenReturn(accountUncommittedEvents);
        when(mockedAccount.getVersion()).thenReturn(3);

        const fakeStore = mock(FakeEventStore);
        when(fakeStore.appendToStream(anyString(), anything(), anyNumber()))
            .thenReject();
        when(fakeStore.appendToStream('bank-account-12312312312', accountUncommittedEvents, 3))
            .thenResolve();

        const repo = new BankAccountsRepositoryImpl(
            instance(fakeStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        repo.save(instance(mockedAccount))
            .then(done);
    });

    it('throws the DuplicatedBankAccountException when adding an account with an already used id', (done) => {
        const accountId = '12312312312';
        const fakeStore = mock(FakeEventStore);
        when (fakeStore.createStream(`bank-account-${accountId}`, anything()))
            .thenReject(new StreamAlreadyExistingException());

        const repo = new BankAccountsRepositoryImpl(
            instance(fakeStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        const newAccount = mock(BankAccountImpl);
        when(newAccount.getId()).thenReturn(new AccountID(accountId));
        when(newAccount.commitEvents()).thenReturn([]);
        when(newAccount.getVersion()).thenReturn(-1);
        
        repo.save(instance(newAccount))
            .catch((error) => {
                expect(error instanceof DuplicatedBankAccountException).toBeTruthy();
                done();
            });
    });

    it('throws the BankAccountNotFoundException when updating an account with a non-existing id', (done) => {
        const fakeAccount = mock(BankAccountImpl);
        when(fakeAccount.getId()).thenReturn(new AccountID('12312312312'));
        when(fakeAccount.commitEvents()).thenReturn([]);
        when(fakeAccount.getVersion()).thenReturn(1);

        const eventStore = mock(FakeEventStore);
        when(eventStore.appendToStream('bank-account-12312312312', anything(), anyNumber()))
            .thenReject(new StreamNotFoundException('Stream not found'));

        const repo = new BankAccountsRepositoryImpl(
            instance(eventStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        repo.save(instance(fakeAccount))
            .catch(error => {
                expect(error instanceof BankAccountNotFoundException).toBeTruthy();
                done();
            });
    });

    it('lets the event store exception arise when something goes wrong while reading the stream', (done) => {
        const eventStore = mock(FakeEventStore);
        when(eventStore.readStreamOffset('bank-account-12312312312', 0))
            .thenReject(new RangeError('Dummy error'));

        const repo = new BankAccountsRepositoryImpl(
            instance(eventStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        repo.getById(new AccountID('12312312312'))
            .catch(error => {
                expect(error instanceof RangeError).toBeTruthy();
                done();
            });
    });

    it('lets the StreamConcurrencyException exception arise when the expected stream version is not met', (done) => {
        const fakeAccount = mock(BankAccountImpl);
        when(fakeAccount.getId()).thenReturn(new AccountID('12312312312'));
        when(fakeAccount.getVersion()).thenReturn(1);
        when(fakeAccount.commitEvents()).thenReturn([]);

        const eventStore = mock(FakeEventStore);
        when(eventStore.appendToStream(anyString(), anything(), anyNumber()))
            .thenReject(new StreamConcurrencyException());

        const repo = new BankAccountsRepositoryImpl(
            instance(eventStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        repo.save(instance(fakeAccount))
            .catch((error) => {
                expect(error instanceof StreamConcurrencyException).toBeTruthy();
                done();
            });
    });

    it('lets the event store exception arise when something goes wrong while adding a new account', (done) => {
        const eventStore = mock(FakeEventStore);
        when(eventStore.createStream('bank-account-12312312312', anything()))
            .thenReject(new RangeError('Some dummy error'));

        const repo = new BankAccountsRepositoryImpl(
            instance(eventStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            0
        );

        const fakeAccount = mock(BankAccountImpl);
        when(fakeAccount.getId()).thenReturn(new AccountID('12312312312'));
        when(fakeAccount.getVersion()).thenReturn(-1);
        when(fakeAccount.commitEvents()).thenReturn([]);

        repo.save(instance(fakeAccount))
            .catch((error) => {
                expect(error instanceof RangeError).toBeTruthy();
                done();
            });
    });

    it('holds the correct value for snapshotInterval', () => {
        const eventStore = new FakeEventStore();

        const repo = new BankAccountsRepositoryImpl(
            instance(eventStore),
            instance(emptySnapshotRepo),
            () => new BankAccountImpl(),
            7
        );

        expect(repo.getSnapshotInterval()).toEqual(7);
    });

});