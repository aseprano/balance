import { IncomingMessage } from "../../messaging/IncomingMessage";
import { EventHandler } from "../../events/EventHandler";
import { IncomingEvent } from "./IncomingEvent";

export class MessageToEventHandler {

    constructor(
        private eventHandler: EventHandler
    ) { }

    private extractEvent(message: IncomingMessage): IncomingEvent {
        const decodedData = JSON.parse(message.data);
        
        return new IncomingEvent(
            decodedData['eventId'],
            decodedData['name'],
            decodedData['dateFired'],
            decodedData['payload'],
            decodedData['streamName'],
            decodedData['seq'],
            message.registrationKey
        );
    }

    public handle(message: IncomingMessage) {
        try {
            this.eventHandler(this.extractEvent(message));
        } catch (e) {
            console.error('*** Error parsing event: ' + e.message);
            throw e;
        }
    }
}