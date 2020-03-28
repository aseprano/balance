import { DBTransaction } from "../../db/DBTransaction";
import { QueryResult } from "../../db/Queryable";
import { DBConnection } from "../../db/DBConnection";
import { Function } from "../../../lib/Function";

type OnEndFunction = Function<void,void>;

export class DBTransactionProxy implements DBTransaction {
    private transactionIsOpen = true;
    private onEndFunctions: OnEndFunction[] = [];
    private randomTxId: string = '';

    constructor(private conn: DBConnection) {
        this.randomTxId = this.generateRandomTransactionId();
    }

    private generateRandomTransactionId(): string {
        let txId = '';

        while (txId.length < 6) {
            txId += Math.floor(Math.random() * 10);
        }

        return txId;
    }

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

    query(sql: string, params?: any[], transactionId?: string): Promise<QueryResult> {
        return this.getConnection()
            .then((conn) => conn.query(sql, params, transactionId || this.randomTxId));
    }

    onEnd(f: OnEndFunction) {
        this.onEndFunctions.push(f);
    }

}