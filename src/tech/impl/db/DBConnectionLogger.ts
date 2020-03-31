import { DBConnection } from "../../db/DBConnection";
import { QueryResult } from "../../db/Queryable";

export class DBConnectionLogger implements DBConnection
{
    private logsOn = true;

    constructor(private dbConnection: DBConnection) {}

    private doLog(message: string, txId?: string, error?: boolean) {
        if (!this.logsOn) {
            return;
        }
        
        (error ? console.error : console.debug)(`[#${txId || '??????'}] ${message}`);
    }

    private doLogQuery(query: string, params?: any[] | undefined, transactionId?: string) {
        if (params && params.length) {
            params.forEach((param) => {
                query = query.replace('?', typeof param === "string" ? `'${param}'` : param);
            });
        }

        this.doLog(`> ${query}`, transactionId);
    }

    query(query: string, params?: any[], transactionId?: string): Promise<QueryResult> {
        this.doLogQuery(query, params, transactionId);

        return this.dbConnection.query(query, params, transactionId)
            .then((ret) => {
                this.doLog(`< OK, ${ret.numberOfAffectedRows} rows affected`, transactionId);
                return ret;
            }).catch((err) => {
                this.doLog(`! ${err}`, transactionId, true);
                return err;
            });
    }

    disableLogs() {
        this.logsOn = false;
    }
    
}