import { MessageHandler } from "./MessageHandler";

export interface MessageReceiver {

    /**
     * 
     * @param messageNamePattern The pattern of the message name.
     *   The '*' symbol can be used to match any character sequence
     *   The '?' symbol can be used to match a single word
     * @param handler 
     * @param registrationKey 
     */
    on(messageNamePattern: string, handler: MessageHandler, registrationKey?: string): void;

}