import { MessageHandler } from "../../messaging/MessageHandler";
import { IncomingMessage } from "../../messaging/IncomingMessage";

export class MessageSubscription {
    private nameRegex: RegExp;

    constructor(
        messageName: string,
        private handler: MessageHandler,
        private registrationKey: string
    ) {
        this.nameRegex = new RegExp(
            '^' +
            messageName.replace(/\./g, '\\.')
                .replace(/[*]/g, '([a-z0-9\\-_]+(\\.[a-z0-9\\-_]+)*)')
                .replace(/[?]/g, '([a-z0-9\\-_]+)')
            + '$',
            'i'
        );
    }

    private messageMatchesSubscription(message: IncomingMessage): boolean {
        return this.nameRegex.test(message.name) && (!this.registrationKey || this.registrationKey === message.registrationKey)
    }
    
    private routeMessageToHandler(message: IncomingMessage) {
        this.handler(message);
    }

    handle(message: IncomingMessage): void {
        if (this.messageMatchesSubscription(message)) {
            this.routeMessageToHandler(message);
        }
    }

}
