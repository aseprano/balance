import { SnapshotRepository } from "../SnapshotRepository";
import { Snapshot } from "../Snapshot";
import { DB } from "../db/DB";

interface SnapshotDBRow {
    stream_id: string,
    data: string,
};

export class SnapshotRepositoryImpl implements SnapshotRepository {

    constructor(
        private db: DB,
        private tableName: string
    ) {}

    private reconstituteSnapshot(row: SnapshotDBRow): Snapshot|undefined {
        return JSON.parse(row.data);
    }

    getById(snapshotId: string): Promise<Snapshot|undefined> {
        return this.db
            .query(
                `SELECT data FROM ${this.tableName} WHERE stream_id = ? ORDER BY id DESC LIMIT 1`,
                [snapshotId]
            ).then((data) => {
                if (data.fields && data.fields.length) {
                    return this.reconstituteSnapshot(data.fields[0]);
                }
            }).catch((err) => {
                return err;
            });
    }
    
    add(snapshotId: string, snapshot: Snapshot): Promise<void> {
        return this.db.query(
            `INSERT INTO ${this.tableName} (stream_id, data) VALUES (?, ?)`,
            [snapshotId, JSON.stringify(snapshot)]
        ).then(() => undefined);
    }

    delete(snapshotId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}