import { EventRegistry } from "../EventRegistry";
import { IncomingEvent } from "../../impl/IncomingEvent";
import { Queryable } from "../../db/Queryable";

export class DBEventRegistry implements EventRegistry {
        
    constructor(
        private tableName: string,
        private projectionId: string,
    ) {}

    store(event: IncomingEvent, connection: Queryable): Promise<boolean> {
        return connection
            .query(`INSERT INTO ${this.tableName} (projection_id, event_id) VALUES (?, ?)`, [this.projectionId, event.getId()])
            .then((ret) => ret.numberOfAffectedRows > 0);
    }

    clear(connection: Queryable): Promise<void> {
        return connection
            .query(`DELETE FROM ${this.tableName} WHERE projection_id = ?`, [ this.projectionId ])
            .then(() => undefined);
    }
    
}