export type EventPayload = {
    [key: string]: any;
}

export interface Event {

    name(): string;

    firedAt(): number;

    payload(): EventPayload;

}