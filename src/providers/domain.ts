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
import { SnapshotRepository } from "../tech/SnapshotRepository";
import { SnapshotRepositoryImpl } from "../tech/impl/SnapshotRepositoryImpl";
import { DB } from "../tech/DB";
import { EnvVariablesConfig, CacheConfigDecorator, CompositeConfig, RedisConfig, Config } from '@darkbyte/ts-config';
const uuid = require('uuidv4').default;
const redis = require('redis');

module.exports = (container: ServiceContainer) => {
    container.declare(
        'Config',
        () => {
            const redisCli = redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                db: process.env.REDIS_DB
            });

            const compositeCfg = new CompositeConfig(new RedisConfig(redisCli, 'banking'))
                .addConfigAtEnd(new EnvVariablesConfig(process.env));

            return new CacheConfigDecorator(compositeCfg, 600);
        }
    ).declare(
        'EventStore',
        (container: ServiceContainer) => {
            const config = container.get('Config');

            const connectionsPool = new FixedSizePool(5, () => {
                return new EventStoreConnectionProxy({
                    host: config.get('EVENT_STORE_HOST'),
                    port: config.get('EVENT_STORE_PORT'),
                });
            });

            return new EventStoreImpl(
                connectionsPool,
                {
                    username: config.get('EVENT_STORE_USERNAME'),
                    password: config.get('EVENT_STORE_PASSWORD')
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
            const config: Config = c.get('Config');

            return require('knex')({
                client: 'mysql',
                connection: {
                  host : config.get('DB_HOST', 'localhost'),
                  user : config.get('DB_USER', 'root'),
                  password : config.get('DB_PASS', 'root'),
                  database : config.get('DB_NAME', 'test')
                },
                pool: {min: 1, max: 5}
              });
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
            const snapshotInterval = 100;
            return new BankAccountsRepositoryImpl(eventStore, accountProvider, snapshotsRepository, snapshotInterval);
        }
    )
}