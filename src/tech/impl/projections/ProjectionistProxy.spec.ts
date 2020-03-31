import { Message, MessageSender } from "@darkbyte/messaging";
import { ProjectionistProxy } from "./ProjectionistProxy";

describe('ProjectionistProxy', () => {

    // it('sends a replay message to the MessageSender', () => {
    //     const messagesSent: Message[] = [];

    //     const fakeMessageSender = {
    //         send: (message: Message) => {
    //             messagesSent.push(message);
    //         }
    //     } as MessageSender;

    //     const proxy = new ProjectionistProxy(fakeMessageSender, );
    //     proxy.replay('proj-123');

    //     expect(messagesSent).toEqual([
    //         {
    //             name: 'com.herrdoktor.messages.replayProjection',
    //             data: 'proj-123'
    //         }
    //     ]);
    // });

});