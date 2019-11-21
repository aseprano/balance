import { ServiceContainer } from "../tech/ServiceContainer";
import { EventStoreImpl } from "../tech/impl/EventStoreImpl";
import RandomAccountIDProvider from "../domain-services/RandomAccountIDProvider";
import { BankAccountFactory } from "../factories/BankAccountFactory";
import { EventStore } from "../tech/EventStore";
import { BankAccountsRepositoryImpl } from "../repositories/impl/BankAccountsRepositoryImpl";
import { BankAccountsRepository } from "../repositories/BankAccountsRepository";
import { AccountServiceImpl } from "../app-services/impl/AccountServiceImpl";
import { LimitedRetryPolicy } from "../tech/impl/LimitedRetryPolicy";
import { StreamConcurrencyException } from "../tech/exceptions/StreamConcurrencyException";
import { BankAccountImpl } from "../entities/impl/BankAccountImpl";
import { BankAccount } from "../entities/BankAccount";
import { Provider } from "../Provider";
import { FixedSizePool } from "../tech/impl/FixedSizePool";
import { EventStoreConnectionProxy } from "../tech/impl/EventStoreConnectionProxy";
import { MySQL } from "../tech/impl/MySQL";
import { EventBusImpl } from "../tech/impl/EventBusImpl";
import { SnapshotRepository } from "../tech/SnapshotRepository";
import { SnapshotRepositoryImpl } from "../tech/impl/SnapshotRepositoryImpl";
import { DB } from "../tech/DB";
const QueryBuilder = require('node-querybuilder');
const uuid = require('uuidv4').default;

module.exports = (container: ServiceContainer) => {
    container.declare(
        'EventStore',
        () => {
            const connectionsPool = new FixedSizePool(5, () => {
                return new EventStoreConnectionProxy({
                    host: 'localhost',
                    port: 1113,
                });
            });

            return new EventStoreImpl(
                connectionsPool,
                {
                    username: 'admin',
                    password: 'changeit'
                },
                () => uuid()
            );
        }
    ).declare(
        'NewAccountFactory',
        () => {
            return new BankAccountFactory(RandomAccountIDProvider);
        }
    ).declare(
        'EmptyAccountProvider',
        () => {
            return () => new BankAccountImpl();
        }
    ).declare(
        'AccountService',
        (c: ServiceContainer) => {
            const accountFactory: BankAccountFactory = c.get('NewAccountFactory');
            const repo: BankAccountsRepository = c.get('BankAccountRepository');
            const retryPolicy = new LimitedRetryPolicy(5, e => e instanceof StreamConcurrencyException);

            return new AccountServiceImpl(repo, accountFactory, retryPolicy);
        }
    ).declare(
        'DB',
        (c: ServiceContainer) => {
            return new MySQL(
                new QueryBuilder(
                    {
                        host: 'localhost',
                        user: 'root',
                        password: 'test',
                        database: 'balances'
                    },
                    'mysql',
                    'pool'
                )
            );
        }
    ).declare(
        'SnapshotRepository',
        (c: ServiceContainer) => {
            const db: DB = c.get('DB');
            return new SnapshotRepositoryImpl(db, 'snapshots');
        }
    ).declare(
        'BankAccountRepository',
        (container: ServiceContainer) => {
            const eventStore: EventStore = container.get('EventStore');
            const accountProvider: Provider<BankAccount> = container.get('EmptyAccountProvider');
            const snapshotsRepository: SnapshotRepository = container.get('SnapshotRepository');
            return new BankAccountsRepositoryImpl(eventStore, accountProvider, snapshotsRepository);
        }
    )
}