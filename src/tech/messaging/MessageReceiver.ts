import { MessageHandler } from "./MessageHandler";

export interface MessageReceiver {

    /**
     * 
     * @param messageNamePattern The pattern of the message name.
     *   The '*' symbol can be used to match any character sequence
     *   The '?' symbol can be used to match a single word
     * @param handler 
     * @param registrationKey The registration key to match the incoming message. If left undefined, any registration key will be accepted. If defined, only registration keys that strictly matches it will.
     */
    on(messageNamePattern: string, handler: MessageHandler, registrationKey?: string): void;

}