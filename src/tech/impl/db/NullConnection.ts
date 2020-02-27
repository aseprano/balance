import { Queryable, QueryResult } from "../../db/Queryable";

export class NullConnection implements Queryable {

    async query(query: string, params?: any[]): Promise<QueryResult> {
        return {
            numberOfAffectedRows: 0,
            lastInsertId: undefined,
            fields: []
        }
    }

}