import { DB } from "../../db/DB";
import { DBTransaction } from "../../db/DBTransaction";
import { MySQLConnection } from "./MySQLConnection";
import { DBTransactionProxy } from "./DBTransactionProxy";
import { QueryResult } from "../../db/Queryable";
import { DBConnectionLogger } from "./DBConnectionLogger";

export class MySQLDB implements DB {

    constructor(private pool: any) {}

    private async getConnection(): Promise<MySQLConnection> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err: any, conn: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new MySQLConnection(conn));
                }
            });
        });
    }

    private dispose(conn: MySQLConnection) {
        console.log('*** Disposing connection ***');
        conn.getInnerConnection().release();
    }

    beginTransaction(): Promise<DBTransaction> {
        return this.getConnection()
            .then((conn) => {
                const connectionWrapper = new DBConnectionLogger(conn);

                return connectionWrapper
                    .query('START TRANSACTION')
                    .then(() => {
                        const tx = new DBTransactionProxy(connectionWrapper)
                        tx.onEnd(() => this.dispose(conn));
                        return tx;
                    });
            });
    }
    
    query(query: string, params?: any[] | undefined): Promise<QueryResult> {
        return this.getConnection()
            .then((conn) => {
                return conn.query(query, params)
                    .then((ret) => {
                        this.dispose(conn);
                        return ret;
                    });
            });
    }
    
}