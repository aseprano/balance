import express, { Express } from 'express';
import { ServiceContainer } from "./tech/ServiceContainer";
import { ConcreteRouter } from "./tech/impl/ConcreteRouter";
import { Router } from "./tech/Router";
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

const serviceContainer = createServiceContainer();

const port = 8000;
const app = express();
app.use(bodyParser.json());

createRoutes(app, serviceContainer);

app.listen(port, () => {
    console.log(`» Listening on port ${port}`);
});
