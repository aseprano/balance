
export interface SnapshotState {
    entityId: any;
    [key: string]: any;
}

export interface Snapshot {
    state: SnapshotState;
    version: number;
}
