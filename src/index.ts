import express, { Express } from 'express';
import { ServiceContainer } from "./tech/ServiceContainer";
import { ConcreteRouter } from "./tech/impl/ConcreteRouter";
import { Router } from "./tech/Router";
import { EventSubscriber } from "./tech/EventSubscriber";
import { EventBus } from "./tech/EventBus";
import bodyParser from "body-parser";

function createServiceContainer(): ServiceContainer {
    const serviceContainer = new ServiceContainer();

    require('./providers/domain')(serviceContainer);
    require('./providers/controllers')(serviceContainer);
    
    return serviceContainer;
}

function createRoutes(express: Express, serviceContainer: ServiceContainer): Router {
    const router = new ConcreteRouter(express, serviceContainer);

    require('./routes/routes')(router);

    return router;
}

function createEventSubscriptions(serviceContainer: ServiceContainer) {
    const eventBus: EventBus = serviceContainer.get('EventBus');
    const subscribers: EventSubscriber[] = require('./event-subscribers/exports')(eventBus);
    subscribers.forEach((s) => s.subscribe(eventBus));
}

const app = express();
app.use(bodyParser.json());

const serviceContainer = createServiceContainer();
createRoutes(app, serviceContainer);
//createEventSubscriptions(serviceContainer);

const port = 8000;
app.listen(port, () => {
    console.log(`» Listening on port ${port}`);
});
