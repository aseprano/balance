export type EventPayload = {
    [key: string]: any;
}

export interface Event {

    getName(): string;

    getPayload(): EventPayload;

}