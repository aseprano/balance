import { SnapshotRepository } from "../SnapshotRepository";
import { Snapshot } from "../Snapshot";
import { DB } from "../DB";

export class SnapshotRepositoryImpl implements SnapshotRepository {

    constructor(
        private db: DB,
        private tableName: string
    ) {}

    private reconstituteSnapshot(row: any): Snapshot|undefined {
        return undefined;
    }

    getById(snapshotId: string): Promise<Snapshot|undefined> {
        return this.db.select(
            ['stream_id', 'data'],
            this.tableName,
            {stream_id: snapshotId},
            ['id desc'],
            1
        ).then((rows: any[]) => {
            return rows.length > 0 ? this.reconstituteSnapshot(rows[0]) : undefined;
        });
    }
    
    add(snapshotId: string, snapshot: Snapshot): Promise<void> {
        return this.db.insert(
            this.tableName,
            {
                stream_id: snapshotId,
                data: JSON.stringify(snapshot)
            }
        );
    }

    delete(snapshotId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}