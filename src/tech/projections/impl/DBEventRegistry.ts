import { EventRegistry } from "../EventRegistry";
import { IncomingEvent } from "../../impl/IncomingEvent";
import { Queryable } from "../../db/Queryable";

export class DBEventRegistry implements EventRegistry {
        
    constructor(
        private db: Queryable,
        private tableName: string,
    ) {}

    store(event: IncomingEvent, projectionId: string): Promise<boolean> {
        return this.db
            .query(`INSERT INTO ${this.tableName} (projection_id, event_id) VALUES (?, ?)`, [projectionId, event.getId()])
            .then((ret) => ret.numberOfAffectedRows > 0);
    }

    clear(projectionId: string): Promise<void> {
        return this.db
            .query(`DELETE FROM ${this.tableName} WHERE projection_id = ?`, [projectionId])
            .then(() => undefined);
    }
    
}