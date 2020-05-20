import express, { Express } from 'express';
import bodyParser from "body-parser";
import { ServiceContainer } from "./tech/impl/ServiceContainer";
import { ConcreteRouter } from "./tech/impl/ConcreteRouter";
import { Router } from "./tech/Router";
import { EventBusImpl } from "./tech/impl/events/EventBusImpl";
import { Projector } from "./tech/projections/Projector";
import { MessagingSystem } from "@darkbyte/messaging";
import { MessageToEventHandler } from "./tech/impl/events/MessageToEventHandler";
import { EventBus } from "./tech/events/EventBus";
import { ProjectorRegistrationService } from "./domain/app-services/ProjectorRegistrationService";
import { ProjectionService } from "./domain/app-services/ProjectionService";
import { Projectionist } from "./tech/projections/Projectionist";
import { ProjectorLogger } from "./projectors/ProjectorLogger";
import { QueuedProjector } from "./projectors/QueuedProjector";
import { DB } from "./tech/db/DB";
import { AbstractDBProjector } from "./projectors/AbstractDBProjector";

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

async function createEventSubscriptions(serviceContainer: ServiceContainer): Promise<EventBusImpl> {
    const eventBus = new EventBusImpl();
    await require('./domain/event-subscriptions')(serviceContainer, eventBus);
    return eventBus;
}

function wrapProjector(projector: Projector, db: DB): Projector {
    if (projector instanceof AbstractDBProjector) {
        projector.setDB(db);
        projector.setHandledEventsTableName('handled_events');
    }

    return new ProjectorLogger(new QueuedProjector(projector));
}

async function loadProjectors(
    serviceContainer: ServiceContainer,
    eventBus: EventBus,
    messagingSystem: MessagingSystem
): Promise<Projector[]> {
    const projectors: Projector[] = await require('./providers/projectors')(serviceContainer);

    if (projectors.length) {
        const db: DB = await serviceContainer.get('DB');
        const projectorsRegtistrationService: ProjectorRegistrationService = await serviceContainer.get('ProjectorsRegistrationService');
        const projectionsService: ProjectionService = await serviceContainer.get('ProjectionService');
        const allEvents: string[] = [];

        const replayHandler = new MessageToEventHandler(
            (incomingEvent) => projectionsService.replay(incomingEvent, incomingEvent.getRegistrationKey())
        );

        projectors.map((p) => wrapProjector(p, db))
            .forEach((projector) => {
                projectorsRegtistrationService.register(projector);
                allEvents.push(...projector.getEventsOfInterest().filter((e) => allEvents.indexOf(e) === -1));
                
                projector.getEventsOfInterest()
                    .forEach((eventName) => {
                        messagingSystem.on(
                            eventName,
                            (message) => replayHandler.handle(message),
                            projector.getId()
                        )
                    });
            });
        
        allEvents.forEach((eventName) => {
            eventBus.on(
                eventName,
                (e) => projectionsService.onEvent(e)
            );
        });

    }

    return projectors;
}

async function bindEventBusToMessagingSystem(serviceContainer: ServiceContainer): Promise<void> {
    const eventsMessagingSystem: MessagingSystem = await serviceContainer.get('EventsMessagingSystem');
    const eventBus: EventBusImpl = await createEventSubscriptions(serviceContainer);
    await loadProjectors(serviceContainer, eventBus, eventsMessagingSystem);

    // Register all the event handlers to the messaging system
    const messageToEventBus = new MessageToEventHandler(async (e) => {
        eventBus.handle(e);
    });

    eventBus.getListOfEventNames()
        .forEach((eventName) => {
            eventsMessagingSystem.on(
                eventName,
                (incomingMessage) => messageToEventBus.handle(incomingMessage),
                ""
            );
        });
}

function doAskReplay(serviceContainer: ServiceContainer) {
    setTimeout(() => {
        serviceContainer.get('Projectionist')
            .then(
                (projectionist: Projectionist) => {
                    //projectionist.replay('com.herrdoktor.projections.account_balances');
                    //projectionist.replay('com.herrdoktor.projections.transactions');
                    //projectionist.replay('com.herrdoktor.projections.monthly_expenses');
                }
            );
    }, 5000);
}

const app = express();
app.use(bodyParser.json());

const serviceContainer = createServiceContainer();
createRoutes(app, serviceContainer);
bindEventBusToMessagingSystem(serviceContainer);

const port = process.env['PORT'] || 80;

app.listen(
    port,
    () => {
        console.log(`» Listening on port ${port}`);
        doAskReplay(serviceContainer);
    }
);        
