import express, { Express } from 'express';
import { ServiceContainer } from "./tech/ServiceContainer";
import { ConcreteRouter } from "./tech/impl/ConcreteRouter";
import { Router } from "./tech/Router";
import bodyParser from "body-parser";
import { RabbitMQEventsListener } from "./tech/RabbitMQEventsListener";
import { EventBusImpl } from "./tech/impl/EventBusImpl";
import { ProjectorRegistrationService } from "./app-services/ProjectorRegistrationService";
import { ConcreteProjectionService } from "./app-services/impl/ConcreteProjectionService";
import { ProjectionServiceEventRegistrationDecorator } from "./app-services/impl/ProjectionServiceEventRegistrationDecorator";
import { EventBus } from "./tech/EventBus";

function createServiceContainer(): ServiceContainer {
    const serviceContainer = new ServiceContainer();

    require('./providers/domain')(serviceContainer);
    require('./providers/controllers')(serviceContainer);
    
    return serviceContainer;
}

function getProjectorsRegistrationService(eventBus: EventBus): ProjectorRegistrationService {
    const concreteService = new ConcreteProjectionService();
    return new ProjectionServiceEventRegistrationDecorator(concreteService, eventBus);
}

function createRoutes(express: Express, serviceContainer: ServiceContainer): Router {
    const router = new ConcreteRouter(express, serviceContainer);

    require('./routes/routes')(router);

    return router;
}

function createEventSubscriptions(serviceContainer: ServiceContainer): EventBusImpl {
    const eventBus = new EventBusImpl();
    const projectorsService = getProjectorsRegistrationService(eventBus);

    require('./providers/projectors')(projectorsService, serviceContainer);
    
    return eventBus;
}

const app = express();
app.use(bodyParser.json());

const serviceContainer = createServiceContainer();
createRoutes(app, serviceContainer);

const eventBus = createEventSubscriptions(serviceContainer);

new RabbitMQEventsListener(
    "amqp://eventbus:eventbus@localhost:5672/banking",
    "test",
    (e) => eventBus.handle(e)
);

const port = 8000;
app.listen(port, () => {
    console.log(`» Listening on port ${port}`);
});
