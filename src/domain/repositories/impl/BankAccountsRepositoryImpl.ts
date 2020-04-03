import { BankAccountsRepository } from "../BankAccountsRepository";
import { AccountID } from "../../values/AccountID";
import { BankAccount } from "../../entities/BankAccount";
import { EventStore } from "../../../tech/events/EventStore";
import { Provider } from "../../../lib/Provider";
import { StreamNotFoundException } from "../../../tech/exceptions/StreamNotFoundException";
import { BankAccountNotFoundException } from "../../exceptions/BankAccountNotFoundException";
import { StreamAlreadyExistingException } from "../../../tech/exceptions/StreamAlreadyExistingException";
import { DuplicatedBankAccountException } from "../../exceptions/DuplicatedBankAccountException";
import { SnapshotRepository } from "../../../tech/SnapshotRepository";
import { AbstractRepository } from "./AbstractRepository";

export class BankAccountsRepositoryImpl extends AbstractRepository implements BankAccountsRepository {

    constructor(
        eventStore: EventStore,
        snapshots: SnapshotRepository,
        private accountFactory: Provider<BankAccount>,
        private snapshotInterval: number
    ) {
        super(eventStore, snapshots);
    }

    private createEmptyAccount(): BankAccount {
        return this.accountFactory();
    }

    protected streamNameForId(id: AccountID): string {
        return 'bank-account-' + id.asString();
    }

    public getSnapshotInterval(): number {
        return this.snapshotInterval;
    }

    public async getById(id: AccountID): Promise<BankAccount> {
        return this.getEventsForId(id)
            .then((events) => {
                const bankAccount = this.createEmptyAccount();
                bankAccount.restoreFromEventStream(events.stream, events.snapshot);
                return bankAccount;
            }).catch((error) => {
                if (error instanceof StreamNotFoundException) {
                    throw new BankAccountNotFoundException();
                }
                
                throw error;
            });
    }

    public async save(account: BankAccount): Promise<void> {
        return this.saveEntity(account)
            .catch((error) => {
                if (error instanceof StreamAlreadyExistingException) {
                    throw new DuplicatedBankAccountException();
                } else if (error instanceof StreamNotFoundException) {
                    throw new BankAccountNotFoundException();
                } else {
                    throw error;
                }
            });
    }

}