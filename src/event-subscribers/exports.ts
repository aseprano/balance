import { ServiceContainer } from "../tech/ServiceContainer";
import { DB } from "../tech/DB";
import { EventSubscriber } from "../tech/EventSubscriber";
import { Balances } from "./Balances";

module.exports = (serviceContainer: ServiceContainer): EventSubscriber[] => {
    const db: DB = serviceContainer.get('DB');

    return [
        new Balances(db),
    ];
}
