import { DBConnection } from "../DBConnection";
import { QueryResult } from "../Queryable";

export class DBConnectionLogger implements DBConnection
{
    constructor(private dbConnection: DBConnection) {}

    query(query: string, params?: any[] | undefined): Promise<QueryResult> {
        console.log(`> ${query}`);

        return this.dbConnection.query(query, params)
            .then((ret) => {
                console.log(`< Success, ${ret.numberOfAffectedRows} rows affected`);
                return ret;
            }).catch((err) => {
                console.error(`! ${err}`);
                return err;
            });
    }
    
}