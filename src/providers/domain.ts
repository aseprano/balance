import { ServiceContainer } from "../tech/ServiceContainer";
import { EventStoreImpl } from "../tech/impl/EventStoreImpl";
import { Connection } from "event-store-client";
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
        'BankAccountRepository',
        (c: ServiceContainer) => {
            const eventStore: EventStore = c.get('EventStore');
            const accountProvider: Provider<BankAccount> = container.get('EmptyAccountProvider');
            return new BankAccountsRepositoryImpl(eventStore, accountProvider);
        }
    ).declare(
        'AccountService',
        (c: ServiceContainer) => {
            const accountFactory: BankAccountFactory = c.get('NewAccountFactory');
            const repo: BankAccountsRepository = c.get('BankAccountRepository');
            const retryPolicy = new LimitedRetryPolicy(5, e => e instanceof StreamConcurrencyException);

            return new AccountServiceImpl(repo, accountFactory, retryPolicy);
        }
    );
}