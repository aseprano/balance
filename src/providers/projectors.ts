import { ProjectorRegistrationService } from "../app-services/ProjectorRegistrationService";
import { BalancesProjector } from "../projectors/BalancesProjector";
import { DBBalancesProjection } from "../projectors/impl/DBBalancesProjection";
import { ServiceContainer } from "../tech/ServiceContainer";
import { DBConnectionProxy } from "../tech/db/impl/DBConnectionProxy";
import { NullConnection } from "../tech/db/impl/NullConnection";
import { DB } from "../tech/db/DB";
import { TransactionalProjectorDecorator } from "../projectors/impl/TransactionalProjectorDecorator";
import { Projector } from "../tech/projections/Projector";
import { Queryable } from "../tech/db/Queryable";
import { DBEventRegistry } from "../tech/projections/impl/DBEventRegistry";
import { DuplicatedEventsProjectorDecorator } from "../projectors/impl/DuplicatedEventsProjectorDecorator";
import { EventRegistry } from "../tech/projections/EventRegistry";
import { EventRegistryLogger } from "../tech/projections/impl/EventRegistryLogger";

function createConnectionProxy(): DBConnectionProxy {
    return new DBConnectionProxy(new NullConnection());
}

function createNewEventRegistry(dbConn: Queryable): EventRegistry {
    return new EventRegistryLogger(new DBEventRegistry(dbConn, 'handled_events'));
}

function wrapProjector(projectorBuilder: (db: Queryable) => Projector, db: DB): Projector {
    const connectionProxy = createConnectionProxy();
    const projector = projectorBuilder(connectionProxy);
    const eventRegistry = createNewEventRegistry(connectionProxy);

    return new TransactionalProjectorDecorator(
        new DuplicatedEventsProjectorDecorator(projector, eventRegistry),
        db,
        connectionProxy
    );
}

function createBalancesProjector(db: Queryable): Projector {
    return new BalancesProjector(new DBBalancesProjection(db));

}
module.exports = (projectors: ProjectorRegistrationService, serviceContainer: ServiceContainer) => {
    serviceContainer.get('DB')
        .then((db: DB) => {
            projectors.register(wrapProjector(createBalancesProjector, db));
        });
}
