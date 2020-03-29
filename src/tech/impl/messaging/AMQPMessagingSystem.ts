import { AMQPMessageReceiver } from "./AMQPMessageReceiver";
import { Channel, Connection } from "amqplib";
import { AMQPMessageSender } from "./AMQPMessageSender";
import { MessagingSystem } from "../../messaging/MessagingSystem";
import { Message } from "../../messaging/Message";
import { IncomingMessage } from "../../messaging/IncomingMessage";
import { Function } from "../../../lib/Function";
import { v4 as uuidv4 } from 'uuid';

const amqp = require('amqplib');

export class AMQPMessagingSystem implements MessagingSystem {
    private connectionPromise: Promise<void>;
    private messageReceiver?: AMQPMessageReceiver;
    private messageSender?: AMQPMessageSender;

    constructor(
        connectionOptions: any,
        private exchangeName: string,
        private queueName: string = '',
    ) {
        this.connectionPromise = amqp.connect(connectionOptions)
            .then((conn: Connection) => {
                console.log('*** Connected to RabbitMQ');
                return conn.createChannel();
            }).then((channel: Channel) => {
                console.log('*** AMQP Channel created');

                if (!queueName) {
                    return channel.assertQueue('', { durable: false, autoDelete: true })
                        .then((response) => this.createSenderAndReceiver(channel, response.queue));
                } else {
                    this.createSenderAndReceiver(channel, queueName);
                }
            }).then(() => undefined);
    }
    
    private createSenderAndReceiver(channel: Channel, queueName: string) {
        this.queueName = queueName;
        this.messageReceiver = new AMQPMessageReceiver(channel, this.exchangeName, this.queueName);
        this.messageSender = new AMQPMessageSender(channel, this.exchangeName, () => uuidv4());
    }

    private getMessageReceiver(): Promise<AMQPMessageReceiver> {
        return this.connectionPromise.then(() => this.messageReceiver!);
    }

    private getMessageSender(): Promise<AMQPMessageSender> {
        return this.connectionPromise.then(() => this.messageSender!);
    }

    async send(message: Message, registrationKey?: string | undefined): Promise<void> {
        return this.getMessageSender()
            .then((sender) => sender.send(message, registrationKey));
    }

    on(messageNamePattern: string, handler: Function<IncomingMessage, void>, registrationKey?: string | undefined): void {
        this.getMessageReceiver()
            .then((receiver) => receiver.on(messageNamePattern, handler, registrationKey));
    }

    startAcceptingMessages(): Promise<void> {
        return this.getMessageReceiver()
            .then((receiver) => receiver.startAcceptingMessages());
    }

}