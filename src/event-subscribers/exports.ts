import { ServiceContainer } from "../tech/ServiceContainer";
import { DB } from "../tech/DB";
import { EventSubscriber } from "../tech/EventSubscriber";
import { Balances } from "./Balances";
import { Transactions } from "./Transactions";
import { MonthlyExpenses } from "./MonthlyExpenses";

module.exports = (serviceContainer: ServiceContainer): EventSubscriber[] => {
    const db: DB = serviceContainer.get('DB');

    return [
        new Balances(db),
        new Transactions(db),
        new MonthlyExpenses(db),
    ];
}
