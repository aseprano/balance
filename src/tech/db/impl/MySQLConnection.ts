import { DBConnection } from "../DBConnection";
import { QueryResult } from "../Queryable";

export class MySQLConnection implements DBConnection {

    constructor(private conn: any) {}

    public getInnerConnection(): any {
        return this.conn;
    }
    
    query(query: string, params?: any[]): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
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