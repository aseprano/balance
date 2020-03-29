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
            decodedData['id'],
            decodedData['name'],
            decodedData['dateFired'],
            decodedData['payload'],
            decodedData['streamName'],
            decodedData['seq'],
            message.registrationKey
        );
    }

    public async handle(message: IncomingMessage): Promise<void> {
        try {
            return this.eventHandler(this.extractEvent(message));
        } catch (error) {
            console.error('*** Error parsing event: ' + error.message);
            return Promise.reject(error);
        }
    }
}