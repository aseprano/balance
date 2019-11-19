import { CustomEvent } from "./CustomEvent";
import { Event } from "./Event";
import { EventHandler } from "./EventHandler";
import { Function } from "../Function";
const amqp = require('amqplib');

export class RabbitMQEventsListener {

    constructor(
        connectionOptions: any,
        private queueName: string,
        private delegate: Function<Event,boolean>
    ) {
        this.connectAndWatchQueue(connectionOptions);
    }

    private connectAndWatchQueue(connectionOptions: any) {
        amqp.connect(connectionOptions)
            .then((conn: any) => {
                console.log('*** Connected to RabbitMQ');
                return conn.createChannel();
            })
            .then((ch: any) => {
                console.log('*** Channel created');
                ch.assertQueue(this.queueName, { durable: true, auto_delete: false, arguments: { "x-queue-type": 'classic' } });

                ch.consume(this.queueName, (data: any) => {
                    const eventData = data.content.toString();
                    console.log(`*** Got event ${eventData}`);

                    const json = JSON.parse(eventData);

                    const event = new CustomEvent(
                        json['name'],
                        json['payload']
                    );

                    if (this.delegate(event)) {
                        console.log("*** Event handled, ACK sent");
                        return ch.ack(data);
                    } else {
                        console.log("*** Event not handled, ACK sent");
                        return ch.ack(data);
                    }
                });

                console.log(`*** Consuming messages from "${this.queueName}"`);
            })
    }
}
