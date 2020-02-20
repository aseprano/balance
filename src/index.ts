import express, { Express } from 'express';
import { ServiceContainer } from "./tech/ServiceContainer";
import { ConcreteRouter } from "./tech/impl/ConcreteRouter";
import { Router } from "./tech/Router";
import bodyParser from "body-parser";
import { RabbitMQEventsListener } from "./tech/RabbitMQEventsListener";
import { EventBusImpl } from "./tech/impl/EventBusImpl";
import { ProjectorRegistrationService } from "./app-services/ProjectorRegistrationService";
import { ConcreteProjectionService } from "./app-services/impl/ConcreteProjectionService";
import { Projector } from "./tech/projections/Projector";
import { DBEventRegistry } from "./tech/projections/impl/DBEventRegistry";
import { DuplicatedEventsProjectorDecorator } from "./projectors/impl/DuplicatedEventsProjectorDecorator";
import { ConcreteProjectorRegistrationService } from "./app-services/impl/ConcreteProjectorRegistrationService";

function createServiceContainer(): ServiceContainer {
    const serviceContainer = new ServiceContainer();

    require('./providers/domain')(serviceContainer);
    require('./providers/controllers')(serviceContainer);
    
    return serviceContainer;
}

function getProjectorsRegistrationService(): ProjectorRegistrationService {
    return new ConcreteProjectorRegistrationService();
}

function createRoutes(express: Express, serviceContainer: ServiceContainer): Router {
    const router = new ConcreteRouter(express, serviceContainer);

    require('./routes/routes')(router);

    return router;
}

async function createEventSubscriptions(serviceContainer: ServiceContainer): Promise<EventBusImpl> {
    const db = await serviceContainer.get('DB');
    const projectorsRegtistrationService = getProjectorsRegistrationService();
    const projectionsService = new ConcreteProjectionService(projectorsRegtistrationService, db);
    const eventBus = new EventBusImpl();

    const projectors: Projector[] = await require('./providers/projectors')(serviceContainer);

    projectors.forEach((projector) => {
        const wrappedProjector = new DuplicatedEventsProjectorDecorator(
            projector,
            new DBEventRegistry('handled_events', projector.getId())
        );

        projectorsRegtistrationService.register(wrappedProjector);

        projector.getEventsOfInterest()
            .forEach((eventName) => {
                eventBus.on(eventName, (e) => projectionsService.onEvent(e));
            });
    });


    return eventBus;
}

const app = express();
app.use(bodyParser.json());

const serviceContainer = createServiceContainer();
createRoutes(app, serviceContainer);

createEventSubscriptions(serviceContainer)
    .then((eventBus) => {
        new RabbitMQEventsListener(
            "amqp://eventbus:eventbus@localhost:5672/banking",
            "test",
            (e) => eventBus.handle(e)
        );
        
        const port = process.env['PORT'] || 8000;
        
        app.listen(
            port,
            () => {
                console.log(`» Listening on port ${port}`);
            }
        );        
    });

