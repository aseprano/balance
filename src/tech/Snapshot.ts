export interface Snapshot {
    state: {
        [key: string]: any
    };

    lastEventId: number;
}