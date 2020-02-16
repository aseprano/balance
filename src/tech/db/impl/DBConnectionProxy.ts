import { Queryable, QueryResult } from "../Queryable";

export class DBConnectionProxy implements Queryable {

    constructor(private connection: Queryable) {}

    public setConnection(newConnection: Queryable) {
        this.connection = newConnection;
    }

    query(query: string, params?: any[]): Promise<QueryResult> {
        return this.connection.query(query, params);
    }

}