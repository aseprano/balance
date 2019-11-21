import { DB } from "../DB";

export class MySQL implements DB {

    constructor(private pool: any) {}

    async insertIgnore(tableName: string, values: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.get_connection((conn: any) => {
                conn.insert(
                    tableName,
                    values,
                    (err: any, res: any) => {
                        conn.release();
                        
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    },
                    true
                )
            });
        });
    }

    async insert(tableName: string, values: any, onDuplicateKey?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.get_connection((conn: any) => {
                conn.insert(
                    tableName,
                    values,
                    (err: any, res: any) => {
                        conn.release();

                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    },
                    false,
                    onDuplicateKey ? `ON DUPLICATE KEY UPDATE ${onDuplicateKey}` : '',
                )
            });
        });
    }

    async update(table: string, values: any, condition: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.pool.get_connection((conn: any) => {
                conn.set(values, null, false)
                .where(condition)
                .update(
                    table,
                    null,
                    (err: any, res: any) => {
                        conn.release();

                        if (err) {
                            throw err;
                        } else {
                            resolve(res);
                        }
                    }
                );
            });
        });
    }

    async select(columns: string[], source: string, condition?: any, orderBy?: string[], limit?: number, offset?: number): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.pool.get_connection((conn: any) => {
                let qb = conn.select(columns);

                if (condition) {
                    qb = qb.where(condition);
                }

                if (limit !== undefined) {
                    qb = qb.limit(limit, offset || 0);
                }

                if (orderBy !== undefined && orderBy.length > 0) {
                    qb = qb.order_by(orderBy);
                }

                qb.get(source, (err: any, response: any) => {
                    conn.release();
        
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response);
                    }
                });
            });
        });
    }
    
}