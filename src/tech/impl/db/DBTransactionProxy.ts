import { DBTransaction } from "../../db/DBTransaction";
import { QueryResult } from "../../db/Queryable";
import { DBConnection } from "../../db/DBConnection";
import { Function } from "../../../lib/Function";

type OnEndFunction = Function<void,void>;

export class DBTransactionProxy implements DBTransaction {
    private transactionIsOpen = true;
    private onEndFunctions: OnEndFunction[] = [];

    constructor(private conn: DBConnection) {}

    private markTransactionClosed(): void {
        this.transactionIsOpen = false;
        this.onEndFunctions.forEach((f) => f());
    }

    private getConnection(): Promise<DBConnection> {
        if (this.transactionIsOpen) {
            return Promise.resolve(this.conn);
        } else {
            return Promise.reject('Transaction closed');
        }
    }

    commit(): Promise<void> {
        return this.getConnection()
            .then((conn) => conn.query('COMMIT'))
            .then(() => this.markTransactionClosed());
    }
    
    rollback(): Promise<void> {
        return this.getConnection()
            .then((conn) => conn.query('ROLLBACK'))
            .then(() => this.markTransactionClosed());
    }

    query(sql: string, params?: any[]): Promise<QueryResult> {
        return this.getConnection()
            .then((conn) => conn.query(sql, params));
    }

    onEnd(f: OnEndFunction) {
        this.onEndFunctions.push(f);
    }

}