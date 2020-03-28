import { DBConnection } from "../../db/DBConnection";
import { QueryResult } from "../../db/Queryable";

export class DBConnectionLogger implements DBConnection
{
    constructor(private dbConnection: DBConnection) {}

    private doLog(message: string, error?: boolean) {
        if (error) {
            console.error(message);
        } else {
            console.debug(message);
        }
    }

    private doLogQuery(query: string, params?: any[] | undefined) {
        if (params && params.length) {
            params.forEach((param) => {
                query = query.replace('?', typeof param === "string" ? `'${param}'` : param);
            });
        }

        this.doLog(`> ${query}`);
    }

    query(query: string, params?: any[] | undefined): Promise<QueryResult> {
        this.doLogQuery(query, params);

        return this.dbConnection.query(query, params)
            .then((ret) => {
                this.doLog(`< OK, ${ret.numberOfAffectedRows} rows affected`);
                return ret;
            }).catch((err) => {
                console.error(`! ${err}`);
                return err;
            });
    }
    
}