import { BankAccountsRepository } from "../BankAccountsRepository";
import { AccountID } from "../../values/AccountID";
import { BankAccount } from "../../entities/BankAccount";
import { EventStore } from "../../tech/EventStore";
import { Provider } from "../../Provider";
import { StreamNotFoundException } from "../../tech/exceptions/StreamNotFoundException";
import { BankAccountNotFoundException } from "../../exceptions/BankAccountNotFoundException";
import { StreamAlreadyExistingException } from "../../tech/exceptions/StreamAlreadyExistingException";
import { DuplicatedBankAccountException } from "../../exceptions/DuplicatedBankAccountException";
import { SnapshotRepository } from "../../tech/SnapshotRepository";
import { Snapshot } from "../../tech/Snapshot";

export class BankAccountsRepositoryImpl implements BankAccountsRepository {

    constructor(
        private eventStore: EventStore,
        private accountFactory: Provider<BankAccount>,
        private snapshots: SnapshotRepository,
        private snapshotInterval: number = 0, // 0 means no snapshots
    ) { }

    private createEmptyAccount(): BankAccount {
        return this.accountFactory();
    }

    private getStreamIdForAccountId(id: AccountID): string {
        return 'bank-account-' + id.asString();
    }

    public getSnapshotInterval(): number {
        return this.snapshotInterval;
    }

    public async getById(id: AccountID): Promise<BankAccount> {
        const streamName = this.getStreamIdForAccountId(id);

        return this.snapshots.getById(streamName)
            .then((snapshot?: Snapshot) => this.eventStore
                .readStreamOffset(streamName, snapshot ? snapshot.lastEventId + 1 : 0)
                .then((stream) => {
                    const bankAccount = this.createEmptyAccount();
                    bankAccount.restoreFromEventStream(stream, snapshot);
                    return bankAccount;
                })
                .catch((error) => {
                    if (error instanceof StreamNotFoundException) {
                        throw new BankAccountNotFoundException();
                    } else {
                        throw error;
                    }
                })
            );
    }

    public async add(account: BankAccount): Promise<void> {
        const streamId = this.getStreamIdForAccountId(account.getId());

        return this.eventStore
            .createStream(streamId, account.commitEvents())
            .catch(error => {
                if (error instanceof StreamAlreadyExistingException) {
                    throw new DuplicatedBankAccountException();
                } else {
                    throw error;
                }
            })
    }

    public async update(bankAccount: BankAccount): Promise<void> {
        const streamId = this.getStreamIdForAccountId(bankAccount.getId());
        
        return this.eventStore
            .appendToStream(streamId, bankAccount.commitEvents(), bankAccount.getVersion());
    }

}