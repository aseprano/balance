import { MessageReceiver } from "../../messaging/MessageReceiver";
import { MessageHandler } from "../../messaging/MessageHandler";
import { Channel, ConsumeMessage } from "amqplib";
import { MessageSubscription } from "./MessageSubscription";
import { IncomingMessage } from "../../messaging/IncomingMessage";

export class AMQPMessageReceiver implements MessageReceiver {
    private subscriptions: MessageSubscription[] = [];

    constructor(
        private channel: Channel,
        private exchangeName: string,
        private queueName: string
    ) {}

    private isValidPattern(pattern: string): boolean {
        return pattern.match(/^([a-z0-9\-_]+|[*]|[?])(\.([a-z0-9\-_]+|[*]|[?]))*$/i) !== null;
    }

    private namePatternToRoutingKey(pattern: string, registrationKey?: string): string {
        return (typeof registrationKey !== "undefined" ? registrationKey + '/' : '') + pattern.replace(/\*/g, '#').replace(/\?/g, '*');
    }
    
    on(messageNamePattern: string, handler: MessageHandler, registrationKey?: string): void {
        if (!this.isValidPattern(messageNamePattern)) {
            throw new Error(`Invalid message name pattern: ${messageNamePattern}`);
        }

        this.subscriptions.push(new MessageSubscription(messageNamePattern, handler, registrationKey));
        
        this.channel.bindQueue(
            this.queueName,
            this.exchangeName,
            this.namePatternToRoutingKey(messageNamePattern, registrationKey)
        );
    }

    parseMessageFromData(data: ConsumeMessage|null): IncomingMessage {
        if (!data) {
            throw new Error('Got no data');
        }

        const stringContent = data!.content.toString();
        const message = JSON.parse(stringContent) as IncomingMessage;

        if (!message.name || !message.data || !message.id) {
            throw new Error('* Got malformed IncomingMessage');
        }

        message.registrationKey = message.registrationKey || '';

        return message;
    }

    route(message: IncomingMessage) {
        this.subscriptions.forEach((subscription) => subscription.handle(message));
    }

    async startAcceptingMessages(): Promise<void> {
        console.debug(`*** Reading messages from queue ${this.queueName}`);
        
        return this.channel.consume(
            this.queueName,
            (data: ConsumeMessage|null) => {
                if (!data) {
                    return;
                }

                try {
                    const message = this.parseMessageFromData(data);
                    //console.debug(`*** Got message: '${message.name}' (regKey: '${message.registrationKey}') from queue: '${this.queueName}'`);
                    this.route(message);
                } catch (e) {
                    console.error('* Error reading message: ' + e.message);
                }

                this.channel.ack(data);
            }
        ).then(() => undefined);
    }
    
}