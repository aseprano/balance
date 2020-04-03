import { DBConnection } from "../../db/DBConnection";
import { QueryResult } from "../../db/Queryable";
import { escapeQuery } from "./funcs";

export class MySQLConnection implements DBConnection {

    constructor(private conn: any) {}

    public getInnerConnection(): any {
        return this.conn;
    }
    
    query(query: string, params?: any[]|{[key: string]: any}, transactionId?: string): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            if (params && !Array.isArray(params)) {
                query = escapeQuery(query, params);
                params = [];
            }

            this.conn.query(query, params, (err: any, results: any, fields: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        fields: results,
                        numberOfAffectedRows: results.affectedRows || 0,
                        lastInsertId: 0
                    });
                }
            });
        });
    }

}