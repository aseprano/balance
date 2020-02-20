import { EventRegistry } from "../EventRegistry";
import { IncomingEvent } from "../../impl/IncomingEvent";
import { Queryable } from "../../db/Queryable";

export class EventRegistryLogger implements EventRegistry {

    constructor(
        private innerEventRegistry: EventRegistry
    ) {}
    
    private logMessage(s: string) {
        console.log(`[EventRegistry] ${s}`);
    }

    store(event: IncomingEvent, connection: Queryable): Promise<boolean> {
        this.logMessage(`*** Storing event: ${event.getId()}`);

        return this.innerEventRegistry
            .store(event, connection)
            .then((success) => {
                this.logMessage(success ? 'Event stored' : `Event ${event.getId()} duplicated`);
                return success;
            }).catch((err) => {
                this.logMessage(err);
                return err;
            });
    }

    clear(connection: Queryable): Promise<void> {
        this.logMessage(`Clearing all stored events`);
        
        return this.innerEventRegistry
            .clear(connection)
            .then(() => {
                this.logMessage(`Events cleared`);
            }).catch((err) => {
                this.logMessage(err);
                return err;
            });
    }
    
}