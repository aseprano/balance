import { MessageSender } from "../../messaging/MessageSender";
import { Message } from "../../messaging/Message";
import { Channel } from "amqplib";
import { Provider } from "../../../lib/Provider";

export class AMQPMessageSender implements MessageSender {

    constructor(
        private channel: Channel,
        private exchangeName: string,
        private uuidGenerator: Provider<string>
    ) {}

    private generateNewId(): string {
        return this.uuidGenerator();
    }

    async send(message: Message, registrationKey?: string | undefined): Promise<void> {
        const routingKey = (registrationKey ? registrationKey + '/' : '') + message.name;

        const data = {
            ...message,
            id: this.generateNewId(),
            registrationKey: registrationKey || '',
        };

        const stringifiedData = JSON.stringify(data);

        console.debug(`* Sending message: ${stringifiedData} to exchange ${this.exchangeName} (routingKey=${routingKey})`);
        
        if (!this.channel.publish(
            this.exchangeName,
            routingKey,
            Buffer.from(stringifiedData)
        )) {
            return Promise.reject(`Error publishing on exchange ${this.exchangeName} using routingKey ${routingKey}`);
        }
    }

}
