import { CustomEvent } from "./CustomEvent";
import { Function } from "../Function";
import { IncomingEvent } from "./impl/IncomingEvent";
const amqp = require('amqplib');

export class RabbitMQEventsListener {

    constructor(
        connectionOptions: any,
        private queueName: string,
        private delegate: Function<IncomingEvent,boolean>
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

                    const event = new IncomingEvent(
                        json['eventId'],
                        json['name'],
                        json['created'].slice(0, 19),
                        json['payload'],
                        json['streamId'],
                        json['eventSeq'],
                    );

                    console.log(event);
                    
                    this.delegate(event);
                    ch.ack(data);
                });

                console.log(`*** Consuming messages from "${this.queueName}"`);
            })
    }
}
