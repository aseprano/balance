import { Snapshot } from "./Snapshot";

export interface SnapshotRepository {

    getById(snapshotId: string): Promise<Snapshot|undefined>;

    add(snapshotId: string, snapshot: Snapshot): Promise<void>;

    delete(snapshotId: string): Promise<void>;

}