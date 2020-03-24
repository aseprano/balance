import { MessageSender } from "../../messaging/MessageSender";
import { Message } from "../../messaging/Message";

export abstract class AbstractMessageSender implements MessageSender {

    abstract send(message: Message, registrationKey?: string | undefined): Promise<void>;

}