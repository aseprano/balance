import { EventRegistry } from "../EventRegistry";
import { IncomingEvent } from "../../impl/IncomingEvent";

export class EventRegistryLogger implements EventRegistry {

    constructor(
        private innerEventRegistry: EventRegistry
    ) {}
    
    private logMessage(s: string) {
        console.log(`[EventRegistry] ${s}`);
    }

    store(event: IncomingEvent, projectionId: string): Promise<boolean> {
        this.logMessage(`*** Storing event: ${event.getId()} for projection ${projectionId}`);

        return this.innerEventRegistry
            .store(event, projectionId)
            .then((success) => {
                this.logMessage(success ? 'Event stored' : `Event ${event.getId()} duplicated for projection ${projectionId}`);
                return success;
            }).catch((err) => {
                this.logMessage(err);
                return err;
            });
    }

    clear(projectionId: string): Promise<void> {
        this.logMessage(`*** Clearing all stored events for projection ${projectionId}`);
        
        return this.innerEventRegistry
            .clear(projectionId)
            .then(() => {
                this.logMessage(`Events cleared for projection ${projectionId}`);
            }).catch((err) => {
                this.logMessage(err);
                return err;
            });
    }
    
}