import express, { Express } from 'express';
import bodyParser from "body-parser";
import { ServiceContainer } from "./tech/impl/ServiceContainer";
import { ConcreteRouter } from "./tech/impl/ConcreteRouter";
import { Router } from "./tech/Router";
import { EventBusImpl } from "./tech/impl/events/EventBusImpl";
import { Projector } from "./tech/projections/Projector";
import { DBEventRegistry } from "./tech/impl/projections/DBEventRegistry";
import { DuplicatedEventsProjectorDecorator } from "./projectors/impl/DuplicatedEventsProjectorDecorator";
import { MessagingSystem } from "./tech/messaging/MessagingSystem";
import { AMQPMessagingSystem } from "./tech/impl/messaging/AMQPMessagingSystem";
import { MessageToEventHandler } from "./tech/impl/events/MessageToEventHandler";
import { EventBus } from "./tech/events/EventBus";
import { ProjectorRegistrationService } from "./domain/app-services/ProjectorRegistrationService";
import { ProjectionService } from "./domain/app-services/ProjectionService";

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

async function createMessagingSystem(): Promise<MessagingSystem> {
    const msg = new AMQPMessagingSystem(
        "amqp://eventbus:eventbus@localhost:5672/banking",
        "all-events",
        "balance-queue",
    );

    msg.startAcceptingMessages();

    return msg;
}

async function createEventSubscriptions(serviceContainer: ServiceContainer, messagingSystem: MessagingSystem): Promise<EventBusImpl> {
    const eventBus = new EventBusImpl();
    await require('./domain/event-subscriptions')(serviceContainer, eventBus);
    return eventBus;
}

async function loadProjectors(
    serviceContainer: ServiceContainer,
    eventBus: EventBus,
    messagingSystem: MessagingSystem
): Promise<Projector[]> {
    const projectors: Projector[] = await require('./providers/projectors')(serviceContainer);

    if (projectors.length) {
        const projectorsRegtistrationService: ProjectorRegistrationService = await serviceContainer.get('ProjectorsRegistrationService');
        const projectionsService: ProjectionService = await serviceContainer.get('ProjectionService');
        const allEvents: string[] = [];

        const replayHandler = new MessageToEventHandler(
            (incomingEvent) => projectionsService.replay(incomingEvent, incomingEvent.getRegistrationKey())
        );

        projectors.forEach((projector) => {
            const wrappedProjector = new DuplicatedEventsProjectorDecorator(
                projector,
                new DBEventRegistry('handled_events', projector.getId())
            );
    
            projectorsRegtistrationService.register(wrappedProjector);
            allEvents.push(...projector.getEventsOfInterest().filter((e) => allEvents.indexOf(e) === -1));
            
            projector.getEventsOfInterest()
                .forEach((eventName) => {
                    messagingSystem.on(
                        eventName,
                        (e) => replayHandler.handle(e),
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

const app = express();
app.use(bodyParser.json());

const serviceContainer = createServiceContainer();
createRoutes(app, serviceContainer);

createMessagingSystem()
    .then(async (messagingSystem) => {
        const eventBus = await createEventSubscriptions(serviceContainer, messagingSystem);
        await loadProjectors(serviceContainer, eventBus, messagingSystem);

        // Register all the event handlers to the messaging system
        const messageToEventBus = new MessageToEventHandler((e) => eventBus.handle(e));

        eventBus.getListOfEventNames()
            .forEach((eventName) => {
                messagingSystem.on(
                    eventName,
                    (incomingMessage) => messageToEventBus.handle(incomingMessage),
                    ''
                );
            });

        const port = process.env['PORT'] || 8000;
        
        app.listen(
            port,
            () => {
                console.log(`» Listening on port ${port}`);
            }
        );        
    });
