import { ServiceContainer } from "../tech/impl/ServiceContainer";
import { EventStoreImpl } from "../tech/impl/events/EventStoreImpl";
import RandomAccountIDProvider from "../domain/domain-services/RandomAccountIDProvider";
import { BankAccountFactory } from "../domain/factories/BankAccountFactory";
import { EventStore } from "../tech/events/EventStore";
import { BankAccountsRepositoryImpl } from "../domain/repositories/impl/BankAccountsRepositoryImpl";
import { BankAccountsRepository } from "../domain/repositories/BankAccountsRepository";
import { AccountServiceImpl } from "../domain/app-services/impl/AccountServiceImpl";
import { LimitedRetryPolicy } from "../tech/impl/LimitedRetryPolicy";
import { StreamConcurrencyException } from "../tech/exceptions/StreamConcurrencyException";
import { BankAccountImpl } from "../domain/entities/impl/BankAccountImpl";
import { BankAccount } from "../domain/entities/BankAccount";
import { Provider } from "../lib/Provider";
import { FixedSizePool } from "../tech/impl/FixedSizePool";
import { EventStoreConnectionProxy } from "../tech/impl/events/EventStoreConnectionProxy";
import { SnapshotRepository } from "../tech/SnapshotRepository";
import { SnapshotRepositoryImpl } from "../tech/impl/SnapshotRepositoryImpl";
import { EnvVariablesConfig, CacheConfigDecorator, CompositeConfig, RedisConfig, Config } from '@darkbyte/ts-config';
import { MySQLDB } from "../tech/impl/db/MySQLDB";
import { ConcreteProjectorRegistrationService } from "../domain/app-services/impl/ConcreteProjectorRegistrationService";
import { ConcreteProjectionService } from "../domain/app-services/impl/ConcreteProjectionService";

const mysql = require('mysql');

const uuid = require('uuidv4').default;
const redis = require('redis');

module.exports = (container: ServiceContainer) => {
    container.declare(
        'Config',
        async () => {
            const redisCli = redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                db: process.env.REDIS_DB
            });

            const redisConfig = new RedisConfig(redisCli, 'banking');
            const envConfig = new EnvVariablesConfig(process.env);
            const compositeCfg = new CompositeConfig(redisConfig).addConfigAtEnd(envConfig);
            return new CacheConfigDecorator(compositeCfg, 600);
        }
    ).declare(
        'EventStore',
        async (container: ServiceContainer) => {
            const config: Config = await container.get('Config');

            return Promise.all([
                config.get('EVENT_STORE_HOST', 'localhost'),
                config.get('EVENT_STORE_PORT', 1113),
                config.get('EVENT_STORE_USERNAME', 'admin'),
                config.get('EVENT_STORE_PASSWORD', 'changeit')
            ]).then((values: string[]) => {
                const pool = new FixedSizePool(
                    5, () => new EventStoreConnectionProxy({
                                host: values[0],
                                port: values[1]
                            })
                );

                return new EventStoreImpl(
                    pool,
                    {
                        username: values[2],
                        password: values[3]
                    },
                    () => uuid()
                );
            });
        }
    ).declare(
        'NewAccountFactory',
        async () => {
            return new BankAccountFactory(RandomAccountIDProvider);
        }
    ).declare(
        'EmptyAccountProvider',
        async () => {
            return () => new BankAccountImpl();
        }
    ).declare(
        'AccountService',
        async (c: ServiceContainer) => {
            const accountFactory: BankAccountFactory = await c.get('NewAccountFactory');
            const repo: BankAccountsRepository = await c.get('BankAccountRepository');
            const retryPolicy = new LimitedRetryPolicy(5, (e) => e instanceof StreamConcurrencyException);

            return new AccountServiceImpl(repo, accountFactory, retryPolicy);
        }
    ).declare(
        'DB',
        async (c: ServiceContainer) => {
            return c.get('Config')
                .then((config: Config) => {
                    return Promise.all([
                        config.get('DB_HOST', 'localhost'),
                        config.get('DB_USER', 'root'),
                        config.get('DB_PASS', 'test'),
                        config.get('DB_NAME', 'balances')
                    ]).then((values) => {
                        console.log('* Got DB config: ', values);

                        const pool = mysql.createPool({
                            connectionLimit : 5,
                            host            : values[0],
                            user            : values[1],
                            password        : values[2],
                            database        : values[3],
                        });

                        return new MySQLDB(pool);
                    });
                });
        }
    ).declare(
        'SnapshotRepository',
        async (c: ServiceContainer) => {
            return c.get('DB')
                .then((db) => new SnapshotRepositoryImpl(db, 'snapshots'));
        }
    ).declare(
        'BankAccountRepository',
        async (container: ServiceContainer) => {
            const eventStore: EventStore = await container.get('EventStore');
            const accountProvider: Provider<BankAccount> = await container.get('EmptyAccountProvider');
            const snapshotsRepository: SnapshotRepository = await container.get('SnapshotRepository');
            const snapshotInterval = 100;
            return new BankAccountsRepositoryImpl(eventStore, accountProvider, snapshotsRepository, snapshotInterval);
        }
    ).declare(
        'ProjectorsRegistrationService',
        async (container: ServiceContainer) => {
            return new ConcreteProjectorRegistrationService();
        }
    ).declare(
        'ProjectionService',
        async (container: ServiceContainer) => {
            const db = await container.get('DB');
            const projectorsRegtistrationService = await container.get('ProjectorsRegistrationService');
            return new ConcreteProjectionService(projectorsRegtistrationService, db);        
        }
    )
}