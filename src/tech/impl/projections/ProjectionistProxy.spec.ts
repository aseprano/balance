import { mock, instance, when, anything, anyNumber, anyString } from "ts-mockito";
import { Message } from "../../messaging/Message";
import { ProjectionistProxy } from "./ProjectionistProxy";
import { MessageSender } from "../../messaging/MessageSender";

describe('ProjectionistProxy', () => {

    it('sends a replay message to the MessageSender', () => {
        const messagesSent: Message[] = [];

        const fakeMessageSender = {
            send: (message: Message) => {
                messagesSent.push(message);
            }
        } as MessageSender;

        const proxy = new ProjectionistProxy(fakeMessageSender);
        proxy.replay('proj-123');

        expect(messagesSent).toEqual([
            {
                name: 'com.herrdoktor.messages.replayProjection',
                data: 'proj-123'
            }
        ]);
    });

});